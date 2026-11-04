import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// The agency's brand, stored once (agency_branding) and read by every client report link,
// the PDF and the widgets. Name required; logo and website as https URLs; accent as #rrggbb.
export function AgencyBrandCard() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [accent, setAccent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('agency_branding')
      .select('name, logo_url, website, accent')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setName(data.name || '');
          setLogoUrl(data.logo_url || '');
          setWebsite(data.website || '');
          setAccent(data.accent || '');
        }
        setLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const save = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error('A name is needed.'); return; }
    if (logoUrl && !/^https:\/\//i.test(logoUrl)) { toast.error('The logo must be an https URL.'); return; }
    if (website && !/^https?:\/\//i.test(website)) { toast.error('The website must be a URL.'); return; }
    if (accent && !/^#[0-9a-fA-F]{6}$/.test(accent)) { toast.error('The accent must be a #rrggbb colour.'); return; }
    setSaving(true);
    const { error } = await supabase.from('agency_branding').upsert({
      user_id: user.id,
      name: name.trim(),
      logo_url: logoUrl.trim() || null,
      website: website.trim() || null,
      accent: accent.trim() || null,
    });
    setSaving(false);
    if (error) toast.error(`Could not save: ${error.message}`);
    else toast.success('Brand saved. Client reports and PDFs carry it from now on.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Your brand</CardTitle>
        <CardDescription>
          Saved once, used everywhere a client sees a report: client report links, PDFs and widgets carry your name and logo instead of RankCLI's.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brandName">Agency name</Label>
            <Input id="brandName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Digital" disabled={!loaded} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandLogo">Logo URL (https, optional)</Label>
            <Input id="brandLogo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://acme.example/logo.png" disabled={!loaded} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandSite">Website (optional)</Label>
            <Input id="brandSite" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.example" disabled={!loaded} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandAccent">Accent colour (optional)</Label>
            <Input id="brandAccent" value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="#22c55e" disabled={!loaded} />
          </div>
        </div>
        <Button onClick={save} disabled={saving || !loaded}>{saving ? 'Saving…' : 'Save brand'}</Button>
      </CardContent>
    </Card>
  );
}
