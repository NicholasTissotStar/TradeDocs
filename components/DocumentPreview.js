
import React, { useState, useRef, useEffect } from 'react';
import { BackIcon, CopyIcon, PencilIcon, SidebarOpenIcon, SidebarCloseIcon, ChevronRightIcon, InfoIcon } from './Icons.js';

const DocumentPreview = ({ doc, onBack, onUpdateContent, isExiting }) => {
  const [copyStatus, setCopyStatus] = useState('Copiar');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(doc.title);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = doc.content;
    }
  }, [doc]);

  const handleCopy = () => {
    const text = `${currentTitle}\n\n${contentRef.current.innerText}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('Copiado!');
      setTimeout(() => setCopyStatus('Copiar'), 2000);
    });
  };

  const handleExportPDF = () => {
    if (!contentRef.current) return;
    const printable = window.open('', '_blank');
    if (!printable) return;
    const dateStr = new Date().toLocaleString('pt-BR');
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${currentTitle} - PDF</title>
          <style>
            :root { --text: #111827; --muted: #374151; --border: #e5e7eb; --bg: #ffffff; --bg-soft: #fafafa; }
            * { box-sizing: border-box; }
            html, body { height: 100%; }
            body { margin: 0; background: var(--bg); color: var(--text); font: 400 11pt ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif; line-height: 1.6; }
            .page { max-width: 840px; margin: 0 auto; padding: 28px; }
            header { display: flex; justify-content: space-between; align-items: center; color: var(--muted); font-size: 10pt; margin-bottom: 18px; }
            h1 { font-size: 26pt; line-height: 1.2; margin: 0 0 18px 0; color: var(--text); }
            h2 { font-size: 18pt; margin: 24px 0 10px; page-break-after: avoid; }
            h3 { font-size: 14pt; margin: 20px 0 8px; page-break-after: avoid; }
            p { margin: 10px 0; }
            ul, ol { margin: 10px 0 10px 22px; }
            li { margin: 4px 0; }
            strong, b { font-weight: 700; }
            em, i { font-style: italic; }
            code { background: #f3f4f6; color: var(--text); border: 1px solid var(--border); border-radius: 4px; padding: 0 4px; font: 500 0.9em ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
            pre { background: #f5f5f7; border: 1px solid var(--border); border-radius: 10px; padding: 14px; overflow: visible; page-break-inside: avoid; }
            pre code { background: transparent; border: none; padding: 0; white-space: pre-wrap; word-break: break-word; }
            blockquote { border-left: 4px solid var(--border); background: var(--bg-soft); padding: 8px 14px; margin: 14px 0; color: var(--muted); }
            table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 10pt; }
            th, td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
            th { background: #f9fafb; }
            img { max-width: 100%; height: auto; }
            a { color: var(--text); text-decoration: underline; word-break: break-all; }
            hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
            .muted { color: var(--muted); }
            .srclist ul { margin-left: 18px; }
            .page .text-indigo-300, .page .text-indigo-400, .page .text-gray-200, .page .text-gray-300, .page .text-gray-400 { color: var(--text) !important; }
            .relative .absolute { display: none !important; }
            .typing-cursor { display: none !important; }
            @page { size: A4; margin: 14mm; }
            @media print {
              .no-print { display: none !important; }
              header { position: running(pageHeader); }
              @bottom-left { content: counter(page) " / " counter(pages); }
            }
          </style>
        </head>
        <body>
          <div class="page" id="print-root">
            <header>
              <div class="muted">${dateStr}</div>
              <div class="muted">Exportado por TradeDocs</div>
            </header>
            <h1>${currentTitle}</h1>
            <div>${contentRef.current.innerHTML}</div>
            ${
              (doc.sources && doc.sources.length > 0)
                ? `<hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;" />
                   <h3>Fontes e Referências</h3>
                   <ul>
                     ${doc.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title || s.url}</a></li>`).join('')}
                   </ul>`
                : ''
            }
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => { window.print(); }, 150);
            });
          </script>
        </body>
      </html>
    `;
    printable.document.open();
    printable.document.write(html);
    printable.document.close();
  };

  const animationClass = isExiting ? 'animate-fade-out' : 'animate-fade-in';

  return (
    React.createElement('div', { className: `flex flex-col h-screen bg-gray-900 ${animationClass}` },
      React.createElement('div', { className: "bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center" },
        React.createElement('button', { onClick: onBack, className: "text-indigo-400 hover:text-indigo-300 flex items-center gap-2" },
          React.createElement(BackIcon, null), "Voltar"
        ),
        React.createElement('div', { className: "flex gap-3" },
          React.createElement('button', { onClick: handleCopy, className: "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors" }, copyStatus),
          React.createElement('button', { onClick: handleExportPDF, className: "bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors" }, "Exportar PDF")
        )
      ),
      React.createElement('div', { className: "flex-1 overflow-y-auto p-4 md:p-8" },
        React.createElement('div', { className: "max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700" },
          React.createElement('div', { className: "p-8" },
            React.createElement('h1', { className: "text-4xl font-bold text-white mb-8 border-b border-gray-700 pb-4" }, doc.title),
            React.createElement('div', { 
              ref: contentRef, 
              className: "prose prose-invert max-w-none text-gray-300 leading-relaxed",
            }),
            
            doc.sources && doc.sources.length > 0 && React.createElement('div', { className: "mt-12 pt-8 border-t border-gray-700" },
              React.createElement('h3', { className: "text-lg font-semibold text-gray-400 mb-4 flex items-center gap-2" },
                React.createElement(InfoIcon, { className: "h-5 w-5" }),
                "Fontes e Referências (Pesquisa Gemini)"
              ),
              React.createElement('ul', { className: "space-y-2" },
                doc.sources.map((source, i) => (
                  React.createElement('li', { key: i },
                    React.createElement('a', { 
                      href: source.url, 
                      target: "_blank", 
                      rel: "noopener noreferrer",
                      className: "text-indigo-400 hover:underline text-sm"
                    }, source.title || source.url)
                  )
                ))
              )
            )
          )
        )
      )
    )
  );
};

export default DocumentPreview;
