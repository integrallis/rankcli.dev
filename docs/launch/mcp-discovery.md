# How Claude, Cursor and Codex users actually find an MCP server

Short version: **not through directories.** The official registry passed 9,400 servers and the
community directories list 9,800+. Being listed makes you one in ten thousand, which is why
submitting to more of them moved nothing. We are already in every list that matters, official
registry, awesome-mcp-servers (merged), Glama, Smithery, mcp.so pending.

Discovery happens three ways, in descending order of how much they actually convert.

## 1. Someone tells them

By a wide margin the largest channel. A Reddit thread, an HN comment, a blog post, a colleague.
This is the same funnel as the rest of the product, and it is why the Reddit and Product Hunt
posts matter more to MCP adoption than any directory submission.

The corollary: **the MCP server should be mentioned in the posts**, not just the CLI. It is the
lowest-friction thing we ship, no signup, no key, nothing leaves the machine, which makes it
the best first touch we have.

## 2. Inside their client

The curated in-client surfaces are far higher signal than a 10,000-row list, because the user
is already looking for a tool at that moment.

- **Claude Code**, `claude mcp add`. The user must already know the name.
- **Claude Desktop**. Extensions. One-click install from a bundle. **We do not ship one.**
- **Cursor**, `mcp.json`, or a one-click deeplink.
- **VS Code / Copilot**, native MCP since 1.99, install URL scheme.
- **Codex**. MCP via config file; same package, no separate work.

Nothing here requires a new server. The same `@rankcli/mcp-server` works in all of them -
MCP is client-agnostic. What differs is only how the user installs it, and every step of
friction there costs installs.

## 3. Search

Weak, and worth knowing why rather than fighting it. On npm, `mcp seo` returns
`@pipeworx/mcp-seo-*` in four of the top five slots and not us: npm ranks on name match and
downloads, and `@rankcli/mcp-server` has "seo" in its keywords but not in its name. Renaming
would break every existing install for a channel that barely converts. Not worth it.

---

## The gap worth closing: one-click install

This is the highest-leverage MCP work available, because it converts "sounds useful" into an
install without the user opening a config file. Put these in the MCP repo README, on
rankcli.dev/docs, and in the Reddit and Dev.to posts.

**Cursor**

```
cursor://anysphere.cursor-deeplink/mcp/install?name=rankcli&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkByYW5rY2xpL21jcC1zZXJ2ZXIiXX0=
```

Markdown button, using Cursor's own badge:

```markdown
[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=rankcli&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkByYW5rY2xpL21jcC1zZXJ2ZXIiXX0=)
```

**VS Code**

```
vscode:mcp/install?%7B%22name%22%3A%22rankcli%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40rankcli%2Fmcp-server%22%5D%7D
```

**Claude Code**, one line, no config file:

```bash
claude mcp add rankcli -- npx -y @rankcli/mcp-server
```

**Claude Desktop / Codex / Windsurf**, the config block we already document:

```json
{ "mcpServers": { "rankcli": { "command": "npx", "args": ["-y", "@rankcli/mcp-server"] } } }
```

The deeplinks are generated from that same config, so they cannot drift from it as long as they
are regenerated together. Verify each one on a real machine before publishing: Cursor's
deeplink handler has had platform-specific breakage, and a dead install button is worse than a
code block.

## Second gap: no Claude Desktop Extension

Claude Desktop installs extensions as a bundle rather than by hand-editing JSON. We ship no
bundle, so Claude Desktop users, likely our largest client audience, given the product is
pitched at Claude users, have the highest-friction path of anyone. Worth building.

## What is not worth doing

More directory submissions. We are in all of them, and the marginal one is a row in a list
nobody reads. The registry entry now points at a repository that resolves, which was the actual
defect: every listing led to a 404, so the listings we had were worth less than nothing.
