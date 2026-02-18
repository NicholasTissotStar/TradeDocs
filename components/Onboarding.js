
import React, { useState } from 'react';
import { Team } from '../types.js';
import { DeveloperIcon, UXUIIcon, AutomationIcon, AIIcon } from './Icons.js';
import { listProviders, setActiveProvider, saveApiKey } from '../services/aiService.js';
import { openAuthWindow } from '../services/authHooks.js';

const teamOptions = [
  { team: Team.Developers, icon: React.createElement(DeveloperIcon, null), label: 'Desenvolvedores' },
  { team: Team.UXUI, icon: React.createElement(UXUIIcon, null), label: 'UX/UI' },
  { team: Team.Automations, icon: React.createElement(AutomationIcon, null), label: 'Automações' },
  { team: Team.AI, icon: React.createElement(AIIcon, null), label: 'IA' },
];

const Onboarding = ({ onComplete }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [responsibleName, setResponsibleName] = useState('');
  const providers = listProviders();
  const [provider, setProvider] = useState(localStorage.getItem('ai-provider') || (providers[0]?.id || 'gemini'));
  const [authMode, setAuthMode] = useState('key');
  const [apiKey, setApiKey] = useState(localStorage.getItem(`ai-keys.${provider}`) || '');
  const [connHook, setConnHook] = useState(localStorage.getItem(`ai-conn.${provider}`) || '');

  const hasToken = !!localStorage.getItem(`ai-tokens.${provider}`) || !!localStorage.getItem(`ai-keys.${provider}`);
  const canComplete = selectedTeam && responsibleName.trim() && ((authMode === 'key' && apiKey.trim()) || (authMode === 'login' && hasToken));

  const handleComplete = () => {
    if (!canComplete) return;
    setActiveProvider(provider);
    if (authMode === 'key') {
      saveApiKey(provider, apiKey.trim());
      localStorage.removeItem(`ai-conn.${provider}`);
    } else {
      localStorage.setItem(`ai-conn.${provider}`, connHook || 'login');
      if (!hasToken) saveApiKey(provider, '');
    }
    onComplete(selectedTeam, responsibleName.trim());
  };

  return (
    React.createElement('div', { className: "flex-grow flex items-center justify-center p-4 animate-fade-in" },
      React.createElement('div', { className: "text-center p-8 max-w-3xl mx-auto bg-gray-800/50 rounded-lg animate-slide-up" },
        React.createElement('h1', { className: "text-4xl font-bold text-white mb-3" },
          "Bem-vindo ao ", "Trade", React.createElement('span', { className: "text-indigo-400" }, "Docs")
        ),
        React.createElement('div', { className: "text-lg text-gray-300 mb-8 space-y-2" },
          React.createElement('p', null, "Sua central de documentos inteligente."),
          React.createElement('p', { className: "text-sm text-gray-400" }, "Antes de começar, escolha o provedor de IA e conecte sua sessão ou insira a chave.")
        ),

        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left" },
          React.createElement('div', { className: "bg-gray-800/60 border border-gray-700 rounded-lg p-4" },
            React.createElement('label', { className: "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" }, "Provedor de IA"),
            React.createElement('select', {
              value: provider,
              onChange: (e) => {
                const v = e.target.value;
                setProvider(v);
                setApiKey(localStorage.getItem(`ai-keys.${v}`) || '');
                setConnHook(localStorage.getItem(`ai-conn.${v}`) || '');
              },
              className: "w-full bg-gray-900 border border-gray-700 text-white rounded-md p-3"
            },
              providers.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
            )
          ),
          React.createElement('div', { className: "bg-gray-800/60 border border-gray-700 rounded-lg p-4" },
            React.createElement('label', { className: "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" }, "Método de Conexão"),
            React.createElement('div', { className: "flex gap-3" },
              React.createElement('button', {
                onClick: () => setAuthMode('key'),
                className: `px-4 py-2 rounded-md border ${authMode === 'key' ? 'border-indigo-500 text-indigo-300 bg-indigo-900/40' : 'border-gray-700 text-gray-300 hover:border-gray-600'}`
              }, "Chave de API"),
              React.createElement('button', {
                onClick: () => setAuthMode('login'),
                className: `px-4 py-2 rounded-md border ${authMode === 'login' ? 'border-indigo-500 text-indigo-300 bg-indigo-900/40' : 'border-gray-700 text-gray-300 hover:border-gray-600'}`
              }, "Login/Conexão")
            ),
            authMode === 'key' && React.createElement('div', { className: "mt-3" },
              React.createElement('input', {
                type: "password",
                value: apiKey,
                onChange: (e) => setApiKey(e.target.value),
                placeholder: "Cole sua API key...",
                className: "w-full bg-gray-900 border border-gray-700 text-white rounded-md p-3"
              }),
              React.createElement('p', { className: "text-[11px] text-gray-500 mt-2" }, "Armazenado apenas no seu navegador.")
            ),
            authMode === 'login' && React.createElement('div', { className: "mt-3" },
              React.createElement('input', {
                type: "text",
                value: connHook,
                onChange: (e) => setConnHook(e.target.value),
                placeholder: "URL/Hook de conexão (opcional)",
                className: "w-full bg-gray-900 border border-gray-700 text-white rounded-md p-3"
              }),
              React.createElement('p', { className: "text-[11px] text-gray-500 mt-2" }, "Você poderá concluir o login após iniciar o app.")
            )
          )
        ),
        
        React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" },
          teamOptions.map(({ team, icon, label }) => (
            React.createElement('button', {
              key: team,
              onClick: () => setSelectedTeam(team),
              className: `p-4 rounded-lg text-center border-2 transition-all duration-200 flex flex-col items-center justify-center aspect-square ${
                selectedTeam === team ? 'border-indigo-500 bg-indigo-900/50 scale-105' : 'border-gray-600 hover:border-indigo-600 hover:bg-gray-700'
              }`
            },
              React.createElement('div', { className: "text-indigo-400 mb-2" }, icon),
              React.createElement('h3', { className: "font-bold text-white text-sm" }, label)
            )
          ))
        ),
        
        React.createElement('div', { className: "max-w-md mx-auto mb-8" },
          React.createElement('label', { htmlFor: "responsible-name", className: "sr-only" }, "Seu Nome (Responsável)"),
          React.createElement('input', {
            type: "text",
            id: "responsible-name",
            value: responsibleName,
            onChange: (e) => setResponsibleName(e.target.value),
            className: "w-full text-center bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            placeholder: "Digite seu nome como responsável"
          })
        ),

        authMode === 'login' && React.createElement('div', { className: "max-w-md mx-auto mb-6" },
          React.createElement('button', {
            onClick: async () => {
              if (!connHook) return;
              try { await openAuthWindow({ url: connHook, provider }); } catch {}
            },
            disabled: !connHook,
            className: "bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition-all disabled:opacity-50"
          }, "Conectar agora")
        ),

        React.createElement('button', {
          onClick: handleComplete,
          disabled: !canComplete,
          className: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        },
          "Começar a Criar"
        )
      )
    )
  );
};

export default Onboarding;
