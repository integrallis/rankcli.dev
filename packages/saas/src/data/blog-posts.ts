// Blog post type
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
  featured?: boolean;
  author: {
    name: string;
    avatar?: string;
  };
}

// Placeholder blog posts - replace with real content
const blogPosts: BlogPost[] = [
  {
    slug: 'introducing-rankcli',
    title: 'Introducing RankCLI: SEO Audits for Developers',
    excerpt: 'A new command-line tool that brings SEO auditing into your development workflow.',
    content: `
# Introducing RankCLI

RankCLI is a developer-first SEO auditing tool that integrates seamlessly into your workflow.

## Why RankCLI?

Traditional SEO tools are designed for marketers, not developers. RankCLI changes that by providing:

- **CLI-first interface** - Run audits from your terminal
- **CI/CD integration** - Catch SEO regressions before they ship
- **Framework-aware** - Understands Next.js, Nuxt, SvelteKit, and more

## Getting Started

\`\`\`bash
npm install -g rankcli
rankcli audit https://your-site.com
\`\`\`

Stay tuned for more updates!
    `,
    publishedAt: '2026-01-30',
    readingTime: '3 min read',
    tags: ['announcement', 'getting-started'],
    featured: true,
    author: {
      name: 'RankCLI Team',
    },
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

// Alias for backwards compatibility
export const getBlogPost = getBlogPostBySlug;

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getBlogPostBySlug(currentSlug);
  if (!current) return [];

  return blogPosts
    .filter((post) => post.slug !== currentSlug)
    .filter((post) => post.tags.some((tag) => current.tags.includes(tag)))
    .slice(0, limit);
}
