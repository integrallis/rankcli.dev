import { Link } from 'react-router-dom';
import { Terminal, Github } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { SOCIAL_PROFILES } from '@/components/SEO';

const footerLinks = {
  product: [
    { label: 'Free Audit', href: '/free-audit' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Documentation', href: '/docs' },
    { label: 'Changelog', href: '/changelog' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Framework SEO guides', href: '/seo' },
    { label: 'Contact', href: '/contact' },
  ],
  compare: [
    { label: 'vs Lighthouse CI', href: '/compare/lighthouse-ci' },
    { label: 'vs squirrelscan', href: '/compare/squirrelscan' },
    { label: 'vs GeoReady', href: '/compare/geoready' },
    { label: 'Screaming Frog alternative', href: '/alternatives/screaming-frog' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50">
      <ScrollReveal className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Terminal className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">RankCLI</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Ship code, get ranked.
              <br />
              Get cited, not just crawled.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href="https://github.com/integrallis/rankcli"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RankCLI on GitHub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              {SOCIAL_PROFILES.filter((p) => p.label !== 'GitHub').map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="font-tech text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {p.label}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-tech text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-tech text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compare */}
          <div>
            <h3 className="font-semibold mb-4">Compare</h3>
            <ul className="space-y-2">
              {footerLinks.compare.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-tech text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-tech text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Integrallis Software, LLC. All rights reserved.
          </p>
        </div>
      </ScrollReveal>
    </footer>
  );
}
