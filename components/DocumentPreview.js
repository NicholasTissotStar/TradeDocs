
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

  const animationClass = isExiting ? 'animate-fade-out' : 'animate-fade-in';

  return (
    React.createElement('div', { className: `flex flex-col h-screen bg-gray-900 ${animationClass}` },
      React.createElement('div', { className: "bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center" },
        React.createElement('button', { onClick: onBack, className: "text-indigo-400 hover:text-indigo-300 flex items-center gap-2" },
          React.createElement(BackIcon, null), "Voltar"
        ),
        React.createElement('div', { className: "flex gap-3" },
          React.createElement('button', { onClick: handleCopy, className: "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors" }, copyStatus)
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
