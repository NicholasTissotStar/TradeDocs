(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var script = document.currentScript;
  if (!script) return;

  var src = script.getAttribute('data-tradedocs-src') || 'https://nicholastissotstar.github.io/TradeDocs/';
  var height = script.getAttribute('data-tradedocs-height') || '800';

  if (!document.getElementById('tradedocs-embed-style')) {
    var style = document.createElement('style');
    style.id = 'tradedocs-embed-style';
    style.textContent = `
    :root {
      color-scheme: dark;
    }
    .td-container {
      width: 100%;
      height: 100vh;
      max-height: ${height}px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(15,23,42,0.6);
      border: 1px solid rgba(148,163,184,0.3);
      background: radial-gradient(circle at top left, rgba(59,130,246,0.35), transparent 55%), #020617;
      box-sizing: border-box;
    }
    .td-header {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 10px 16px;
      background: linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.85));
      border-bottom: 1px solid rgba(30,64,175,0.5);
      color: #e5e7eb;
      font-size: 12px;
      letter-spacing: .16em;
      text-transform: uppercase;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .td-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .td-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(15,118,110,0.18);
      color: #a5f3fc;
      font-size: 10px;
    }
    .td-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #22c55e;
      box-shadow: 0 0 10px rgba(34,197,94,0.9);
    }
    .td-frame {
      width: 100%;
      height: calc(100% - 42px);
      border: none;
      display: block;
      background: #020617;
    }`;
    document.head.appendChild(style);
  }

  var container = document.createElement('div');
  container.className = 'td-container';

  var header = document.createElement('div');
  header.className = 'td-header';

  var headerLeft = document.createElement('div');
  headerLeft.className = 'td-header-left';

  var dot = document.createElement('span');
  dot.className = 'td-dot';
  headerLeft.appendChild(dot);

  var title = document.createElement('span');
  title.textContent = 'TRADEDOCS';
  headerLeft.appendChild(title);

  var pill = document.createElement('span');
  pill.className = 'td-pill';
  pill.textContent = 'AI DOCS';
  headerLeft.appendChild(pill);

  header.appendChild(headerLeft);

  var iframe = document.createElement('iframe');
  iframe.className = 'td-frame';
  iframe.src = src;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';

  container.appendChild(header);
  container.appendChild(iframe);

  var parent = script.parentNode;
  if (parent) {
    parent.insertBefore(container, script);
  } else {
    document.body.appendChild(container);
  }
})(); 

