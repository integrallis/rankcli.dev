/**
 * RankCLI Embeddable Widget Script
 *
 * Usage:
 * <div id="rankcli-widget"></div>
 * <script src="https://rankcli.dev/widget.js?token=widget_xxx&theme=light"></script>
 *
 * White-labelling (no "Powered by RankCLI") follows the widget owner's plan
 * and is decided server-side; an old `branding` parameter is ignored.
 */
(function () {
  'use strict';

  // Get script parameters
  var script = document.currentScript;
  var params = new URLSearchParams(script.src.split('?')[1] || '');
  var token = params.get('token');
  var theme = params.get('theme') || 'light';

  if (!token) {
    console.error('RankCLI Widget: Missing token parameter');
    return;
  }

  // Find the widget container
  var container = document.getElementById('rankcli-widget');
  if (!container) {
    console.error('RankCLI Widget: Container element #rankcli-widget not found');
    return;
  }

  // Create iframe
  var iframe = document.createElement('iframe');
  var iframeParams = new URLSearchParams({
    token: token,
    theme: theme,
  });

  iframe.src = 'https://rankcli.dev/widget?' + iframeParams.toString();
  iframe.width = '340';
  iframe.height = '180';
  iframe.frameBorder = '0';
  iframe.style.cssText = 'border-radius: 12px; border: none; display: block;';
  iframe.loading = 'lazy';
  iframe.title = 'RankCLI SEO Score Widget';

  // Append iframe to container
  container.appendChild(iframe);

  // Listen for resize messages from iframe
  window.addEventListener('message', function (event) {
    if (event.origin !== 'https://rankcli.dev') return;
    if (event.data && event.data.type === 'rankcli-widget-resize') {
      iframe.height = event.data.height;
    }
  });
})();
