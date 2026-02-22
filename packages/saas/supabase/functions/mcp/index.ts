/**
 * RankCLI MCP Server - Hosted Endpoint
 * 
 * Model Context Protocol server for AI assistants to perform SEO analysis.
 * This is the hosted version - users just need their API key.
 * 
 * Usage in Claude Desktop config:
 * {
 *   "mcpServers": {
 *     "rankcli": {
 *       "url": "https://bspljbxwbjiqueeyzyat.supabase.co/functions/v1/mcp",
 *       // Or use the custom domain when configured:
 *       // "url": "https://api.rankcli.dev/mcp",
 *       "headers": { "Authorization": "Bearer YOUR_API_KEY" }
 *     }
 *   }
 * }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { runFullAudit } from "../_shared/audit/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// MCP Tool definitions
const TOOLS = [
  {
    name: "seo_audit",
    description: `Run a comprehensive SEO audit on any URL. Analyzes 200+ factors including:
- On-page SEO (title, meta, headings, content)
- Technical SEO (performance, security, mobile)
- GEO (AI search visibility for ChatGPT, Perplexity, Claude)
- Structured data validation
- Core Web Vitals estimates
Returns actionable recommendations with priority ranking.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to audit (e.g., https://example.com)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "seo_geo_check",
    description: `Check if a URL is optimized for AI search engines (GEO - Generative Engine Optimization).
Analyzes visibility in ChatGPT, Perplexity, Claude, and Gemini responses.
Checks robots.txt AI crawler rules, content structure, and citation readiness.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to check for AI search optimization",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "seo_robots_check",
    description: `Analyze a site's robots.txt for AI crawler permissions. Shows which AI crawlers are allowed or blocked.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Site URL (will fetch /robots.txt)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "seo_compare",
    description: `Compare SEO metrics between two URLs. Useful for competitive analysis.`,
    inputSchema: {
      type: "object",
      properties: {
        url1: {
          type: "string",
          description: "First URL to compare",
        },
        url2: {
          type: "string",
          description: "Second URL to compare",
        },
      },
      required: ["url1", "url2"],
    },
  },
];

// Validate API key
async function validateApiKey(apiKey: string): Promise<{ valid: boolean; userId?: string; tier?: string }> {
  if (!apiKey || !apiKey.startsWith("rk_")) {
    return { valid: false };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id, users(subscription_tier)")
    .eq("key_hash", await hashApiKey(apiKey))
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { valid: false };
  }

  return {
    valid: true,
    userId: data.user_id,
    tier: data.users?.subscription_tier || "free",
  };
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Fetch URL content
async function fetchUrl(url: string): Promise<{ html: string; headers: Record<string, string>; robotsTxt?: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "RankCLI-Bot/1.0 (SEO Analysis; +https://rankcli.dev)",
    },
  });
  
  const html = await response.text();
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Try to fetch robots.txt
  let robotsTxt: string | undefined;
  try {
    const robotsUrl = new URL("/robots.txt", url).toString();
    const robotsResponse = await fetch(robotsUrl);
    if (robotsResponse.ok) {
      robotsTxt = await robotsResponse.text();
    }
  } catch {
    // Ignore robots.txt errors
  }

  return { html, headers, robotsTxt };
}

// Handle tool calls
async function handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "seo_audit": {
      const url = args.url as string;
      const { html, headers, robotsTxt } = await fetchUrl(url);
      
      const result = await runFullAudit(html, url, {
        robotsTxt,
        headers,
        includeAI: true,
      });

      // Format result
      const criticalIssues = result.issues.filter((i: any) => i.severity === "critical");
      const warnings = result.issues.filter((i: any) => i.severity === "warning");

      return `# SEO Audit: ${url}

**Overall Score:** ${result.score}/100
**Issues Found:** ${criticalIssues.length} critical, ${warnings.length} warnings

## Critical Issues
${criticalIssues.slice(0, 10).map((i: any) => `- **${i.code}:** ${i.message}`).join("\n") || "None!"}

## Top Recommendations
${result.recommendations?.slice(0, 5).map((r: any, idx: number) => `${idx + 1}. ${r}`).join("\n") || "Site looks good!"}

## Scores by Category
- On-Page SEO: ${result.categories?.onPage || "N/A"}/100
- Technical: ${result.categories?.technical || "N/A"}/100
- Performance: ${result.categories?.performance || "N/A"}/100
- Security: ${result.categories?.security || "N/A"}/100
`;
    }

    case "seo_geo_check": {
      const url = args.url as string;
      const { html, robotsTxt } = await fetchUrl(url);

      const result = await runFullAudit(html, url, { robotsTxt, includeAI: true });
      const geoChecks = result.issues.filter((i: any) => 
        i.code?.startsWith("GEO_") || i.code?.startsWith("AI_")
      );

      return `# GEO Analysis: ${url}

**AI Search Visibility Score:** ${result.categories?.geo || result.score}/100

## AI Crawler Access
${robotsTxt ? analyzeRobotsTxt(robotsTxt) : "Could not fetch robots.txt"}

## Issues for AI Visibility
${geoChecks.map((i: any) => `- **${i.code}:** ${i.message}`).join("\n") || "No AI-specific issues found!"}

## Recommendations for AI Search
- Ensure GPTBot, ClaudeBot, PerplexityBot are allowed in robots.txt
- Use clear, factual content that AI can cite
- Add structured data (FAQ, HowTo schemas)
- Avoid JavaScript-only content rendering
`;
    }

    case "seo_robots_check": {
      const url = args.url as string;
      const robotsUrl = new URL("/robots.txt", url).toString();
      
      try {
        const response = await fetch(robotsUrl);
        if (!response.ok) {
          return `Could not fetch robots.txt from ${robotsUrl} (status: ${response.status})`;
        }
        const robotsTxt = await response.text();
        return `# robots.txt Analysis: ${url}

\`\`\`
${robotsTxt}
\`\`\`

${analyzeRobotsTxt(robotsTxt)}
`;
      } catch (error) {
        return `Error fetching robots.txt: ${error}`;
      }
    }

    case "seo_compare": {
      const url1 = args.url1 as string;
      const url2 = args.url2 as string;

      const [fetch1, fetch2] = await Promise.all([
        fetchUrl(url1),
        fetchUrl(url2),
      ]);

      const [result1, result2] = await Promise.all([
        runFullAudit(fetch1.html, url1, { robotsTxt: fetch1.robotsTxt }),
        runFullAudit(fetch2.html, url2, { robotsTxt: fetch2.robotsTxt }),
      ]);

      return `# SEO Comparison

| Metric | ${new URL(url1).hostname} | ${new URL(url2).hostname} |
|--------|---------------------------|---------------------------|
| Overall Score | ${result1.score}/100 | ${result2.score}/100 |
| Critical Issues | ${result1.issues.filter((i: any) => i.severity === "critical").length} | ${result2.issues.filter((i: any) => i.severity === "critical").length} |
| Warnings | ${result1.issues.filter((i: any) => i.severity === "warning").length} | ${result2.issues.filter((i: any) => i.severity === "warning").length} |

## Winner: ${result1.score > result2.score ? new URL(url1).hostname : new URL(url2).hostname}
`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

function analyzeRobotsTxt(robotsTxt: string): string {
  const aiCrawlers = [
    { name: "GPTBot", agent: "GPTBot" },
    { name: "ChatGPT-User", agent: "ChatGPT-User" },
    { name: "ClaudeBot", agent: "ClaudeBot" },
    { name: "Claude-Web", agent: "Claude-Web" },
    { name: "PerplexityBot", agent: "PerplexityBot" },
    { name: "Google-Extended", agent: "Google-Extended" },
    { name: "Amazonbot", agent: "Amazonbot" },
  ];

  const lines = robotsTxt.toLowerCase().split("\n");
  const results: string[] = [];

  for (const crawler of aiCrawlers) {
    const agentLower = crawler.agent.toLowerCase();
    let status = "⚪ Not mentioned (defaults to allowed)";
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("user-agent:") && line.includes(agentLower)) {
        // Check next lines for allow/disallow
        for (let j = i + 1; j < lines.length && !lines[j].trim().startsWith("user-agent:"); j++) {
          const rule = lines[j].trim();
          if (rule === "disallow: /") {
            status = "❌ Blocked";
            break;
          } else if (rule === "allow: /") {
            status = "✅ Allowed";
            break;
          }
        }
        break;
      }
    }
    
    results.push(`- ${crawler.name}: ${status}`);
  }

  return `## AI Crawler Status\n${results.join("\n")}`;
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate API key
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32600, message: "Missing API key. Get one at https://rankcli.dev" },
          id: null,
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const auth = await validateApiKey(apiKey);
    if (!auth.valid) {
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32600, message: "Invalid API key" },
          id: null,
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON-RPC request
    const body = await req.json();
    const { method, params, id } = body;

    // Handle MCP methods
    switch (method) {
      case "initialize": {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            result: {
              protocolVersion: "2024-11-05",
              serverInfo: {
                name: "rankcli",
                version: "1.0.0",
              },
              capabilities: {
                tools: {},
              },
            },
            id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "tools/list": {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            result: { tools: TOOLS },
            id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "tools/call": {
        const { name, arguments: args } = params;
        
        try {
          const result = await handleToolCall(name, args || {});
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              result: {
                content: [{ type: "text", text: result }],
              },
              id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              result: {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true,
              },
              id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      default: {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32601, message: `Method not found: ${method}` },
            id,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32700, message: `Parse error: ${error.message}` },
        id: null,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
