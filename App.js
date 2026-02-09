
import React, { useState, useEffect } from 'react';
import Header from './components/Header.js';
import CreationModal from './components/CreationModal.js';
import DocumentPreview from './components/DocumentPreview.js';
import Onboarding from './components/Onboarding.js';
import ConfirmationModal from './components/ConfirmationModal.js';
import { PlusIcon, DocumentIcon, TrashIcon, InfoIcon, SearchIcon, UserIcon } from './components/Icons.js';
import { Team } from './types.js';

const ResponsibleModal = ({ isOpen, onClose, currentResponsible, onResponsibleSave }) => {
  const [responsibleName, setResponsibleName] = useState(currentResponsible || '');
  
  useEffect(() => {
    if (isOpen) {
      setResponsibleName(currentResponsible || '');
    }
  }, [isOpen, currentResponsible]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (responsibleName.trim()) {
      onResponsibleSave(responsibleName.trim());
    }
    onClose();
  };

  return (
    React.createElement('div', {
      className: "fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in",
      onClick: onClose, role: "dialog", "aria-modal": "true", "aria-labelledby": "responsible-title"
    },
      React.createElement('div', {
        className: "bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-slide-up border border-gray-700 overflow-hidden",
        onClick: (e) => e.stopPropagation()
      },
        React.createElement('div', { className: "p-8 flex items-center gap-4 bg-gray-800/50 border-b border-gray-700" },
          React.createElement('div', { className: "p-3 bg-indigo-900/30 rounded-2xl text-indigo-400" }, 
            React.createElement(UserIcon, { className: "h-6 w-6" })
          ),
          React.createElement('h3', { id: "responsible-title", className: "text-xl leading-6 font-bold text-white" }, "Perfil de Responsável")
        ),
        React.createElement('form', { onSubmit: handleSave },
          React.createElement('div', { className: "p-8 space-y-4" },
            React.createElement('div', { className: "space-y-2" },
              React.createElement('label', { htmlFor: "responsible-name", className: "text-xs font-bold text-gray-500 uppercase tracking-widest" }, "Nome Completo"),
              React.createElement('input', {
                id: "responsible-name", type: "text", value: responsibleName,
                onChange: (e) => setResponsibleName(e.target.value),
                className: "w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder-gray-600",
                placeholder: "Digite como deseja ser citado...", autoFocus: true
              })
            )
          ),
          React.createElement('div', { className: "bg-gray-800/50 px-8 py-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-700" },
            React.createElement('button', { type: "button", className: "px-6 py-2 text-gray-400 hover:text-white transition-colors font-medium", onClick: onClose }, "Cancelar"),
            React.createElement('button', { type: "submit", className: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-xl transition-all transform hover:scale-105" }, 'Salvar Alterações')
          )
        )
      )
    )
  );
};

const App = () => {
  const [currentTeam, setCurrentTeam] = useState(Team.Developers);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const [isResponsibleModalOpen, setIsResponsibleModalOpen] = useState(false);
  const [lastViewedDocId, setLastViewedDocId] = useState(null);
  const [isExitingPreview, setIsExitingPreview] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');

  useEffect(() => {
    const savedDocs = localStorage.getItem('synapsedocs-documents');
    const savedTeam = localStorage.getItem('synapsedocs-team');
    const hasOnboarded = localStorage.getItem('synapsedocs-onboarded');
    const savedResponsible = localStorage.getItem('synapsedocs-responsible');

    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedTeam && Object.values(Team).includes(savedTeam)) setCurrentTeam(savedTeam);
    if (savedResponsible) setResponsiblePerson(savedResponsible);
    if (hasOnboarded && savedResponsible) setShowOnboarding(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('synapsedocs-documents', JSON.stringify(documents));
    localStorage.setItem('synapsedocs-team', currentTeam);
    localStorage.setItem('synapsedocs-responsible', responsiblePerson);
    if (!showOnboarding) localStorage.setItem('synapsedocs-onboarded', 'true');
  }, [documents, currentTeam, showOnboarding, responsiblePerson]);

  const handleDocumentCreate = (title, content, sources = []) => {
    const newDocument = {
      id: new Date().toISOString(),
      title,
      content,
      sources,
      team: currentTeam,
      createdAt: new Date().toLocaleString('pt-BR'),
    };
    setDocuments([newDocument, ...documents]);
    setSelectedDocument(newDocument);
    setLastViewedDocId(newDocument.id);
  };
  
  const handleDocumentUpdate = (docId, updates) => {
    const updatedDocs = documents.map(doc => doc.id === docId ? { ...doc, ...updates } : doc);
    setDocuments(updatedDocs);
    if (selectedDocument && selectedDocument.id === docId) {
      setSelectedDocument({ ...selectedDocument, ...updates });
    }
  };
  
  const handleConfirmDelete = () => {
    if (docToDelete) setDocuments(documents.filter(doc => doc.id !== docToDelete.id));
    setIsDeleteConfirmOpen(false);
    setDocToDelete(null);
  };
  
  const handleBackFromPreview = () => {
      setIsExitingPreview(true);
      setTimeout(() => {
          setSelectedDocument(null);
          setIsExitingPreview(false);
      }, 300);
  };

  const handleCompleteOnboarding = (selectedTeam, name) => {
    setCurrentTeam(selectedTeam);
    setResponsiblePerson(name);
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return React.createElement('div', { className: "bg-gray-900 min-h-screen text-white font-sans" },
            React.createElement(Onboarding, { onComplete: handleCompleteOnboarding })
        );
  }

  const filteredDocs = documents.filter(d => d.team === currentTeam && (
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    React.createElement('div', { className: "bg-gray-900 min-h-screen text-white font-sans" },
      selectedDocument ? (
        React.createElement(DocumentPreview, {
          doc: selectedDocument,
          onBack: handleBackFromPreview,
          onUpdateContent: handleDocumentUpdate,
          isExiting: isExitingPreview,
        })
      ) : (
        React.createElement(React.Fragment, null,
          React.createElement(Header, { 
            currentTeam: currentTeam, 
            onTeamChange: (team) => { setCurrentTeam(team); }, 
            onOpenResponsibleSettings: () => setIsResponsibleModalOpen(true),
            responsiblePerson: responsiblePerson
          }),
          React.createElement('div', { className: "bg-indigo-950/40 text-indigo-300 text-[10px] font-bold tracking-widest text-center py-2 border-b border-indigo-900/50 flex items-center justify-center gap-3" },
            React.createElement('div', { className: "w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" }),
            "GEMINI 3 PRO ENGINE ACTIVE • ARCHITECTURAL REASONING v2 • GOOGLE SEARCH GROUNDING"
          ),
          React.createElement('main', { className: "container mx-auto p-4 md:p-8 animate-fade-in" },
            React.createElement('div', { className: "flex flex-col md:flex-row gap-4 mb-10" },
              React.createElement('div', { className: "relative flex-grow group" },
                React.createElement('input', {
                  type: "text",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  placeholder: "Pesquisar no repositório local...",
                  className: "w-full bg-gray-800/50 border border-gray-700 text-white rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-indigo-600 outline-none transition-all group-hover:border-gray-600"
                }),
                React.createElement('div', { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" },
                  React.createElement(SearchIcon, { className: "text-gray-500" })
                )
              ),
              React.createElement('button', {
                onClick: () => setIsModalOpen(true),
                className: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-950/20"
              },
                React.createElement(PlusIcon, { className: "h-5 w-5" }),
                React.createElement('span', null, "Novo Documento Pro")
              )
            ),
            
            React.createElement('div', null,
                React.createElement('div', { className: "flex items-center gap-3 mb-8" },
                  React.createElement('div', { className: "h-0.5 flex-grow bg-gradient-to-r from-transparent via-gray-800 to-transparent" }),
                  React.createElement('h2', { className: "text-xs font-bold text-gray-500 uppercase tracking-[0.2em]" }, `REPOSITÓRIO ${currentTeam}`),
                  React.createElement('div', { className: "h-0.5 flex-grow bg-gradient-to-r from-transparent via-gray-800 to-transparent" })
                ),
                
                filteredDocs.length > 0 ? (
                  React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" },
                    filteredDocs.map((doc) => (
                      React.createElement('div', {
                        key: doc.id,
                        onClick: () => { setSelectedDocument(doc); setLastViewedDocId(doc.id); },
                        className: `bg-gray-800/40 backdrop-blur-sm p-8 rounded-3xl border border-gray-700/50 cursor-pointer hover:bg-gray-800 hover:border-indigo-600/50 transition-all group relative ${doc.id === lastViewedDocId ? 'ring-2 ring-indigo-600 shadow-2xl shadow-indigo-950/40' : 'shadow-lg'}`
                      },
                        React.createElement('div', { className: "flex items-start justify-between mb-6" },
                          React.createElement('div', { className: "p-3 bg-indigo-900/30 rounded-2xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all" },
                            React.createElement(DocumentIcon, { className: "h-6 w-6" })
                          ),
                          React.createElement('button', {
                            onClick: (e) => { e.stopPropagation(); setDocToDelete(doc); setIsDeleteConfirmOpen(true); },
                            className: "text-gray-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          }, React.createElement(TrashIcon, { className: "h-5 w-5" }))
                        ),
                        React.createElement('h3', { className: "text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors truncate" }, doc.title),
                        React.createElement('div', { className: "flex items-center gap-4 text-[10px] text-gray-500 font-mono uppercase tracking-widest" },
                          React.createElement('span', null, doc.createdAt),
                          doc.sources?.length > 0 && React.createElement('span', { className: "bg-indigo-950/50 text-indigo-400 px-2 py-0.5 rounded-full" }, `${doc.sources.length} FONTES`)
                        )
                      )
                    ))
                  )
                ) : (
                  React.createElement('div', { className: "text-center py-24 px-10 bg-gray-800/20 rounded-[40px] border-2 border-dashed border-gray-800" },
                    React.createElement('div', { className: "text-gray-700 mb-6 flex justify-center" }, 
                      React.createElement(DocumentIcon, { className: "h-16 w-16 opacity-10" })
                    ),
                    React.createElement('h3', { className: "text-xl font-bold text-gray-500 mb-3" }, "Nenhuma documentação estratégica encontrada"),
                    React.createElement('p', { className: "text-sm text-gray-600 mb-8 max-w-sm mx-auto" }, "Seu time ainda não possui documentos gerados via Gemini 3 Pro. Comece um novo projeto agora."),
                    React.createElement('button', { onClick: () => setIsModalOpen(true), className: "bg-gray-800 hover:bg-gray-700 text-indigo-400 font-bold py-3 px-8 rounded-2xl border border-gray-700 transition-all" },
                        "Iniciar Primeiro Projeto"
                    )
                  )
                )
            )
          )
        )
      ),
      isModalOpen && React.createElement(CreationModal, { onClose: () => setIsModalOpen(false), onDocumentCreate: handleDocumentCreate, currentTeam: currentTeam, responsiblePerson: responsiblePerson }),
      isDeleteConfirmOpen && React.createElement(ConfirmationModal, { isOpen: isDeleteConfirmOpen, onClose: () => setIsDeleteConfirmOpen(false), onConfirm: handleConfirmDelete, title: "Excluir Registro", message: `Deseja apagar permanentemente "${docToDelete?.title}"? Esta ação não pode ser desfeita.` }),
      React.createElement(ResponsibleModal, { isOpen: isResponsibleModalOpen, onClose: () => setIsResponsibleModalOpen(false), currentResponsible: responsiblePerson, onResponsibleSave: setResponsiblePerson })
    )
  );
};

export default App;
