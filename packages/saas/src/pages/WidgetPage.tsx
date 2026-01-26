import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface WidgetData {
  score: number;
  errors: number;
  warnings: number;
  lastAudit: string;
  siteName: string;
  theme: 'light' | 'dark';
  branding: boolean;
}

export function WidgetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const theme = (searchParams.get('theme') || 'light') as 'light' | 'dark';
  const showBranding = searchParams.get('branding') !== 'false';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WidgetData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Widget token required');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/widget-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Invalid widget token');
        }

        const result = await response.json();
        setData({
          ...result,
          theme,
          branding: showBranding,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load widget');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, theme, showBranding]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f3f4f6' : '#1f2937';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120px',
          backgroundColor: bgColor,
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
        }}
      >
        <Loader2
          className="animate-spin"
          style={{ width: '24px', height: '24px', color: mutedColor }}
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: bgColor,
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          color: '#ef4444',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
        }}
      >
        {error || 'Widget error'}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: bgColor,
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '320px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: textColor,
            }}
          >
            SEO Score
          </h3>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: mutedColor,
            }}
          >
            {data.siteName}
          </p>
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: getScoreColor(data.score),
            lineHeight: 1,
          }}
        >
          {data.score}
        </div>
      </div>

      {/* Issues */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: '500', color: textColor }}>
              {data.errors}
            </span>
            <span style={{ fontSize: '12px', color: mutedColor }}>errors</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#eab308',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: '500', color: textColor }}>
              {data.warnings}
            </span>
            <span style={{ fontSize: '12px', color: mutedColor }}>warnings</span>
          </div>
        </div>
      </div>

      {/* Last Audit */}
      <p
        style={{
          margin: 0,
          fontSize: '11px',
          color: mutedColor,
        }}
      >
        Last audit: {new Date(data.lastAudit).toLocaleDateString()}
      </p>

      {/* Branding */}
      {data.branding && (
        <a
          href="https://rankcli.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: `1px solid ${borderColor}`,
            fontSize: '11px',
            color: mutedColor,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Powered by RankCLI
        </a>
      )}
    </div>
  );
}
