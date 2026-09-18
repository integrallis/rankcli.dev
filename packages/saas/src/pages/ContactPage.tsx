import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Github } from 'lucide-react';
import { SEO } from '@/components/SEO';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact"
        description="Contact RankCLI: email support@rankcli.dev for account, billing and general questions, or open an issue on GitHub for bugs and feature requests."
        path="/contact"
      />
      <Navbar />

      <main className="container py-16 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact us</h1>
        <p className="text-muted-foreground mb-10">
          Questions, bug reports, or feedback - here's how to reach us.
        </p>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
              <CardDescription>
                For account, billing, or general questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:support@rankcli.dev" className="text-primary hover:underline">
                support@rankcli.dev
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Github className="h-5 w-5" />
                GitHub Issues
              </CardTitle>
              <CardDescription>
                For bugs, feature requests, or anything CLI-related.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://github.com/integrallis/rankcli-cli/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                github.com/integrallis/rankcli-cli/issues
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
