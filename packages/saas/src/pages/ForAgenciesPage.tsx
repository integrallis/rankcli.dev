import { Link } from 'react-router-dom';
import { ArrowRight, Globe, FileText, Link2, Users, Bell, Code2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const POINTS = [
  { icon: Globe, title: 'Any client site, by URL', text: 'No repository, no install on the client\'s side. Add the site, and it is audited daily: 280+ checks for search and for the AI answers, including which crawlers the site actually lets in.' },
  { icon: FileText, title: 'Reports under your brand', text: 'Save your name, logo and colour once. Every PDF and every client report link carries them; RankCLI appears nowhere on what the client sees.' },
  { icon: Link2, title: 'A live link per client', text: 'A report link that stays current with the latest audit, with an expiry you choose, and a score widget for the client\'s own site if they want one.' },
  { icon: Bell, title: 'You hear first', text: 'The day a crawler that AI answers draw from stops getting into a client\'s site, or the score drops, you get the alert by email, Slack or Discord, before the client asks.' },
  { icon: Code2, title: 'Fixes as pull requests, when there is a repository', text: 'For the clients who connect GitHub, the fix arrives as a pull request their developer reviews; for the rest, the report says what to change and why, with the evidence.' },
  { icon: Users, title: 'Fifty sites, one plan', text: 'Agency is $99 a month for 50 sites, daily audits, white-label reports and client links, 10 open auto-fix PRs per site, and 10,000 API calls a day. Every account starts with 14 days of Pro to try it on.' },
];

export function ForAgenciesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="RankCLI for agencies" description="Audit every client site by URL, daily, with 280+ SEO and AI-search checks; white-label PDFs and live client report links under your brand; alerts the day a crawler stops getting in. $99 a month for 50 sites." path="/for-agencies" />
      <Navbar />
      <main className="container px-6 md:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">The client audit, done by Monday morning</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Every client site audited daily for search and for the AI answers, the report under your brand, and an alert the day something breaks. The hand-written audit, replaced.
          </p>
          <div className="flex flex-wrap gap-3 mb-14">
            <Link to="/signup?plan=agency"><Button className="gap-2">Start with 14 days of Pro<ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/free-audit"><Button variant="outline">Audit a client site now, free</Button></Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-14">
            {POINTS.map((p) => (
              <Card key={p.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><p.icon className="h-4 w-4 text-muted-foreground" /></div>
                    <h2 className="font-semibold">{p.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <section className="mb-14">
            <h2 className="text-xl font-semibold mb-3">What the checks say, and why clients believe them</h2>
            <p className="text-muted-foreground mb-3">
              Every finding carries the study or the documented crawler behaviour behind it. The AI-search checks fetch the page as each crawler and report by class the way OpenAI and Anthropic document them: a CDN rule that answers 403 to Claude-SearchBot shows up by name, which robots.txt never tells you. Findings that fired on nearly every site were removed after a public run across the 400 most popular npm packages' homepages; <Link to="/data/npm-sites" className="underline">the dataset is public</Link>.
            </p>
          </section>

          <section className="mb-14">
            <h2 className="text-xl font-semibold mb-3">Bring the next agency</h2>
            <p className="text-muted-foreground">
              Every account has a referral link. An agency you refer starts with 30 days of Pro; when they pay, you get a month of your plan free. Credit, never cash; the link is on your account page.
            </p>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link to="/pricing"><Button className="gap-2">See the Agency plan<ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/compare/otterly"><Button variant="outline">How it differs from brand-tracking tools</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
