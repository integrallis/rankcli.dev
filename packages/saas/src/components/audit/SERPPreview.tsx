interface SERPPreviewProps {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
}

export function SERPPreview({ url, title, description, favicon }: SERPPreviewProps) {
  // Extract domain from URL
  let domain = '';
  let path = '';
  try {
    const parsed = new URL(url);
    domain = parsed.hostname;
    path = parsed.pathname !== '/' ? parsed.pathname : '';
  } catch {
    domain = url;
  }

  // Truncate title and description to typical Google limits
  const displayTitle = title
    ? title.length > 60 ? title.slice(0, 57) + '...' : title
    : 'Page Title Not Found';

  const displayDescription = description
    ? description.length > 160 ? description.slice(0, 157) + '...' : description
    : 'No meta description found. Add a compelling description to improve click-through rates.';

  const isTitleTooLong = title && title.length > 60;
  const isTitleTooShort = title && title.length < 30;
  const isDescTooLong = description && description.length > 160;
  const isDescTooShort = description && description.length < 120;

  return (
    <div className="space-y-4">
      {/* Google SERP Preview */}
      <div className="p-4 rounded-lg border bg-white">
        <p className="text-xs text-muted-foreground mb-3">Google Search Preview</p>

        <div className="flex items-center gap-3 mb-1">
          {favicon ? (
            <img src={favicon} alt="" className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {domain.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">{domain}</p>
            <p className="text-xs text-muted-foreground">{`${domain}${path}`}</p>
          </div>
        </div>

        <h3 className="text-xl text-blue-700 hover:underline cursor-pointer leading-tight mb-1">
          {displayTitle}
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed">
          {displayDescription}
        </p>
      </div>

      {/* Warnings */}
      <div className="space-y-2 text-sm">
        {!title && (
          <div className="flex items-center gap-2 text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Missing title tag - critical for SEO
          </div>
        )}
        {isTitleTooLong && (
          <div className="flex items-center gap-2 text-yellow-600">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Title is too long ({title?.length} chars) - may be truncated
          </div>
        )}
        {isTitleTooShort && (
          <div className="flex items-center gap-2 text-yellow-600">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Title is too short ({title?.length} chars) - aim for 50-60 characters
          </div>
        )}
        {!description && (
          <div className="flex items-center gap-2 text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Missing meta description
          </div>
        )}
        {isDescTooLong && (
          <div className="flex items-center gap-2 text-yellow-600">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Description is too long ({description?.length} chars) - may be truncated
          </div>
        )}
        {isDescTooShort && (
          <div className="flex items-center gap-2 text-yellow-600">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Description is short ({description?.length} chars) - aim for 120-160 characters
          </div>
        )}
        {title && !isTitleTooLong && !isTitleTooShort && description && !isDescTooLong && !isDescTooShort && (
          <div className="flex items-center gap-2 text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Title and description look good!
          </div>
        )}
      </div>
    </div>
  );
}
