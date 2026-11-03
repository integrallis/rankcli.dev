# RankCLI private beta

Thanks for taking a look. RankCLI audits a site for search and for AI answers (280+ checks:
crawlability, metadata, structured data, Core Web Vitals, and which crawlers your robots.txt
and your CDN let through), from the command line, in CI, or from an AI assistant. The checks
say what the evidence says; where they are wrong, we want to hear it.

This repository is private and so is this beta. Please keep it that way for now.

## What we would like from you

Run it on a site you care about, then tell us two things in a Discussion here:

1. **Where it was wrong.** A finding you disagree with, a score that makes no sense, a fix
   that would break something.
2. **Where it was unclear.** A step you had to think about, a word you had to look up, a
   thing you expected and did not find.

That is the whole ask. No survey.

## Ten minutes

```bash
npm install -g @rankcli/cli          # or: brew install integrallis/tap/rankcli
rankcli audit --url https://your-site.example
```

The report prints the score, the categories and every finding with its code. `-o json` gives
the same as JSON, `-o llm` as Markdown for an assistant.

To gate a build (fails on any error, or on a score under 80):

```bash
rankcli audit --url https://your-site.example --fail-on error --fail-on "score<80"
```

In GitHub Actions:

```yaml
- uses: integrallis/rankcli-action@v1
  with:
    url: https://your-site.example
    fail-on: error
```

Auditing the build output before a deploy (`--dir dist`), framework plugins for Astro, Nuxt,
Next.js and Vite, the MCP server for Claude, Cursor and friends, and the config file are in
the docs: https://rankcli.dev/docs

## The hosted product

https://rankcli.dev runs the same audit on a schedule, keeps the history, and opens auto-fix
pull requests on a connected repository. Sign in with GitHub. Everything in the beta is on
the free plan; nothing you do here costs anything.

## What is known

- The audit is strict about structured data and AI crawler access on purpose; a site that
  disallows the training crawlers (GPTBot, ClaudeBot) is reported as a notice, not an error.
- Scores move between releases when checks are added or removed. The changelog says what
  changed: https://rankcli.dev/changelog
- The engine and the CLI are source-available (FSL-1.1-MIT) at
  https://github.com/integrallis/rankcli; bugs in a check can go there as issues too.

## Feedback

Open a Discussion in this repository, or an Issue if it is a bug. `FEEDBACK.md` has a short
template if you want one. We answer within the day.
