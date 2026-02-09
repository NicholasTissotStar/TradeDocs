
import React, { useState, useRef, memo } from 'react';
import { LoadingSpinner, PlusIcon, TrashIcon, DragHandleIcon, UploadIcon, FileIcon, JsonIcon, CloseIcon } from './Icons.js';
import { generateDocumentStructure, generateFullDocumentContent, markdownToHtml } from '../services/geminiService.js';

const StructureItem = memo(({ item, index, parentIndex, onTitleChange, onAddSubItem, onRemoveItem }) => {
    const isChild = parentIndex !== null;
    return React.createElement('div', { className: `relative group ${isChild ? 'ml-6' : ''}` },
        React.createElement('div', {
            className: 'flex items-center gap-2 p-2 rounded-lg bg-gray-800/70 border border-gray-700/50 hover:border-indigo-500/30 transition-all my-1'
        },
            React.createElement(DragHandleIcon, { className: 'h-4 w-4 text-gray-600' }),
            React.createElement('input', { 
              type: 'text', 
              value: item.title, 
              onChange: (e) => onTitleChange(e.target.value, isChild ? parentIndex : index, isChild ? index : null), 
              className: 'w-full bg-transparent text-white text-sm focus:outline-none placeholder-gray-500' 
            }),
            React.createElement('div', { className: 'flex opacity-0 group-hover:opacity-100 transition-opacity' },
                !isChild && React.createElement('button', { onClick: () => onAddSubItem(index), className: 'p-1 hover:text-indigo-400' }, React.createElement(PlusIcon, { className: 'h-4 w-4' })),
                React.createElement('button', { onClick: () => onRemoveItem(isChild ? parentIndex : index, isChild ? index : null), className: 'p-1 hover:text-red-500' }, React.createElement(TrashIcon, { className: 'h-4 w-4' }))
            )
        ),
        item.children && item.children.length > 0 && item.children.map((child, subIndex) => React.createElement(StructureItem, {
            key: child.id || subIndex, item: child, index: subIndex, parentIndex: index,
            onTitleChange, onAddSubItem, onRemoveItem
        }))
    );
});

const StructureEditor = ({ structure, setStructure, title, description }) => {
    const handleTitleChange = (newTitle, idx, subIdx) => {
        const n = JSON.parse(JSON.stringify(structure));
        if (subIdx === null) n[idx].title = newTitle; else n[idx].children[subIdx].title = newTitle;
        setStructure(n);
    };
    const addItem = (pIdx) => {
        const n = JSON.parse(JSON.stringify(structure));
        const i = { title: 'Novo Tópico', id: Date.now() };
        if (pIdx === null) n.push(i); else { if (!n[pIdx].children) n[pIdx].children = []; n[pIdx].children.push(i); }
        setStructure(n);
    };
    const removeItem = (pIdx, cIdx) => {
        const n = JSON.parse(JSON.stringify(structure));
        if (cIdx === null) n.splice(pIdx, 1); else n[pIdx].children.splice(cIdx, 1);
        setStructure(n);
    };
    return React.createElement('div', { className: "space-y-4" },
      React.createElement('div', null,
        React.createElement('h3', { className: "text-lg font-bold text-indigo-300" }, title),
        React.createElement('p', { className: "text-sm text-gray-400" }, description)
      ),
      React.createElement('div', { className: "max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar space-y-1" }, 
        structure.map((item, index) => React.createElement(StructureItem, { 
          key: item.id || index, 
          item, index, parentIndex: null, 
          onTitleChange: handleTitleChange, 
          onAddSubItem: addItem, 
          onRemoveItem: removeItem 
        }))
      ),
      React.createElement('button', { onClick: () => addItem(null), className: 'w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-sm text-gray-500 hover:border-indigo-600 hover:text-indigo-400 transition-all font-medium' }, "+ Adicionar Seção Estratégica")
    );
};

const CreationModal = ({ onClose, onDocumentCreate, currentTeam, responsiblePerson }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [technicalStructure, setTechnicalStructure] = useState([]);
  const [generationStep, setGenerationStep] = useState('form');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState('');
  const [teamData, setTeamData] = useState({ pastedCode: '', uploadedFiles: [] });
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        setTeamData(prev => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, { name: file.name, content, type: file.name.endsWith('.json') ? 'json' : 'text' }]
        }));
      };
      reader.readAsText(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setTeamData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateStructures = async () => {
    if (!projectName.trim()) { setError('Por favor, informe o nome do projeto.'); return; }
    setError('');
    setGenerationStep('loading');
    setLoadingMessage('Analisando arquitetura (Gemini 3 Pro Reasoning)...');
    try {
        const tech = await generateDocumentStructure({ projectName, description, team: currentTeam, teamData, responsiblePerson });
        setTechnicalStructure(tech.map((t, i) => ({ ...t, id: Date.now() + i })));
        setGenerationStep('review');
    } catch (err) { 
      setError('Erro ao analisar: ' + err.message); 
      setGenerationStep('form'); 
    }
  };

  const handleGenerateFinal = async () => {
      setGenerationStep('generating');
      setStreamingContent('');
      try {
          const result = await generateFullDocumentContent({ projectName, description, team: currentTeam, teamData, responsiblePerson }, technicalStructure, (u) => setLoadingMessage(u.message), (t) => setStreamingContent(prev => prev + t));
          onDocumentCreate(result.title, result.content, result.sources);
          onClose();
      } catch (err) { 
        setError('Erro na escrita final: ' + err.message); 
        setGenerationStep('review'); 
      }
  }

  if (generationStep === 'generating') {
    return React.createElement('div', { className: "fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" },
        React.createElement('div', { className: "bg-gray-900 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-gray-800 overflow-hidden" },
            React.createElement('div', { className: "p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50" }, 
              React.createElement('div', { className: "flex items-center gap-4" },
                React.createElement(LoadingSpinner, { className: "h-6 w-6 text-indigo-500" }),
                React.createElement('div', null,
                  React.createElement('h2', { className: "text-xl font-bold text-white" }, "Escrita Inteligente em Andamento"),
                  React.createElement('p', { className: "text-[10px] font-mono text-indigo-400 tracking-widest uppercase" }, "Processing via Gemini 3 Pro + Search Grounding")
                )
              ),
              React.createElement('button', { onClick: onClose, className: "text-gray-500 hover:text-white transition-colors p-2" }, "✕")
            ),
            React.createElement('div', { className: "flex-grow p-10 overflow-y-auto custom-scrollbar" },
              React.createElement('div', { className: "max-w-3xl mx-auto prose prose-invert prose-indigo", dangerouslySetInnerHTML: { __html: markdownToHtml(streamingContent) + '<span class="typing-cursor"></span>' } })
            ),
            React.createElement('div', { className: "p-5 bg-gray-900 border-t border-gray-800 flex justify-between items-center" },
              React.createElement('span', { className: "text-sm text-gray-500 italic font-light" }, loadingMessage),
              React.createElement('div', { className: "flex gap-2" },
                React.createElement('div', { className: "w-2 h-2 rounded-full bg-indigo-500 animate-pulse" }),
                React.createElement('div', { className: "w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-75" }),
                React.createElement('div', { className: "w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-150" })
              )
            )
        )
    );
  }

  return React.createElement('div', { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in", onClick: onClose },
    React.createElement('div', { className: "bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-700 overflow-hidden", onClick: e => e.stopPropagation() },
        React.createElement('div', { className: "p-6 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center" }, 
          React.createElement('h2', { className: "text-2xl font-bold text-white" }, "Novo Documento Pro"),
          React.createElement('span', { className: "text-[10px] font-bold text-indigo-400 border border-indigo-400/30 px-2 py-1 rounded-full uppercase tracking-tighter" }, "Thinking Mode v3")
        ),
        
        React.createElement('div', { className: "flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar" },
            error && React.createElement('div', { className: "p-4 bg-red-900/20 border border-red-800/50 text-red-400 rounded-xl text-sm" }, error),
            
            generationStep === 'form' && React.createElement('div', { className: "space-y-6" },
                React.createElement('div', { className: "space-y-2" },
                  React.createElement('label', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Identificação"),
                  React.createElement('input', { 
                    placeholder: "Nome do Projeto...", 
                    value: projectName, 
                    onChange: e => setProjectName(e.target.value), 
                    className: "w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder-gray-600" 
                  })
                ),
                React.createElement('div', { className: "space-y-2" },
                  React.createElement('label', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Objetivo Estratégico"),
                  React.createElement('textarea', { 
                    placeholder: "Descreva o propósito deste projeto...", 
                    value: description, 
                    onChange: e => setDescription(e.target.value), 
                    className: "w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white h-28 focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder-gray-600 resize-none" 
                  })
                ),
                React.createElement('div', { className: "space-y-2" },
                  React.createElement('label', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Contexto de Código (Pasted)"),
                  React.createElement('textarea', { 
                    placeholder: "Cole trechos de código para análise rápida...", 
                    value: teamData.pastedCode, 
                    onChange: e => setTeamData({...teamData, pastedCode: e.target.value}), 
                    className: "w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white h-32 font-mono text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder-gray-600 resize-none" 
                  })
                ),
                React.createElement('div', { className: "space-y-3" },
                  React.createElement('label', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Arquivos de Contexto (.txt, .json)"),
                  React.createElement('div', { 
                    onClick: () => fileInputRef.current.click(),
                    className: "border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-900/30 transition-all flex flex-col items-center gap-2 group"
                  },
                    React.createElement(UploadIcon, { className: "h-6 w-6 text-gray-500 group-hover:text-indigo-400" }),
                    React.createElement('span', { className: "text-sm text-gray-400 group-hover:text-gray-300" }, "Arraste ou clique para anexar arquivos técnico"),
                    React.createElement('input', { 
                      type: "file", 
                      ref: fileInputRef, 
                      onChange: handleFileUpload, 
                      className: "hidden", 
                      multiple: true, 
                      accept: ".txt,.json" 
                    })
                  ),
                  teamData.uploadedFiles.length > 0 && React.createElement('div', { className: "flex flex-wrap gap-2 mt-4" },
                    teamData.uploadedFiles.map((file, idx) => (
                      React.createElement('div', { key: idx, className: "flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg text-xs animate-fade-in group" },
                        file.type === 'json' ? React.createElement(JsonIcon, { className: "h-3.5 w-3.5 text-yellow-500" }) : React.createElement(FileIcon, { className: "h-3.5 w-3.5 text-blue-400" }),
                        React.createElement('span', { className: "text-gray-300 truncate max-w-[120px]" }, file.name),
                        React.createElement('button', { onClick: (e) => { e.stopPropagation(); removeFile(idx); }, className: "text-gray-500 hover:text-red-400 transition-colors" }, 
                          React.createElement(CloseIcon, { className: "h-3 w-3" })
                        )
                      )
                    ))
                  )
                )
            ),

            generationStep === 'loading' && React.createElement('div', { className: "flex flex-col items-center justify-center py-24 space-y-6" },
                React.createElement(LoadingSpinner, { className: "h-14 w-14 text-indigo-500" }),
                React.createElement('div', { className: "text-center space-y-1" },
                  React.createElement('p', { className: "text-indigo-300 font-bold text-lg animate-pulse" }, loadingMessage),
                  React.createElement('p', { className: "text-xs text-gray-500" }, "Analisando dependências e padrões arquiteturais...")
                )
            ),

            generationStep === 'review' && React.createElement(StructureEditor, { 
              structure: technicalStructure, 
              setStructure: setTechnicalStructure, 
              title: "Mapa de Conteúdo Gerado",
              description: "Edite ou reordene as seções que o Gemini 3 Pro analisou para o seu projeto."
            })
        ),

        React.createElement('div', { className: "p-6 border-t border-gray-700 bg-gray-800/50 flex justify-end gap-4" },
            React.createElement('button', { onClick: onClose, className: "px-6 py-2 text-gray-400 hover:text-white transition-colors font-medium" }, "Descartar"),
            generationStep === 'form' && React.createElement('button', { onClick: handleGenerateStructures, className: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-xl shadow-indigo-950/20 transition-all transform hover:scale-105 active:scale-95" }, "Analisar Estrutura"),
            generationStep === 'review' && React.createElement('button', { onClick: handleGenerateFinal, className: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-xl shadow-indigo-950/20 transition-all transform hover:scale-105 active:scale-95" }, "Gerar Conteúdo Pro")
        )
    )
  );
};

export default CreationModal;
