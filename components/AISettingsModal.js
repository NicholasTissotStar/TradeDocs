import React, { useEffect, useState } from 'react';
import { SettingsIcon, CloseIcon } from './Icons.js';
import { listProviders, setActiveProvider, saveApiKey, PROVIDER_IDS } from '../services/aiService.js';
import { openAuthWindow } from '../services/authHooks.js';

const AISettingsModal = ({ isOpen, onClose, onApplied }) => {
  const providers = listProviders();
  const [provider, setProvider] = useState(localStorage.getItem('ai-provider') || PROVIDER_IDS.GEMINI);
  const [keys, setKeys] = useState({
    [PROVIDER_IDS.GEMINI]: localStorage.getItem('ai-keys.gemini') || '',
    [PROVIDER_IDS.OPENAI]: localStorage.getItem('ai-keys.openai') || '',
    [PROVIDER_IDS.ANTHROPIC]: localStorage.getItem('ai-keys.anthropic') || '',
  });

  useEffect(() => {
    if (isOpen) {
      setProvider(localStorage.getItem('ai-provider') || PROVIDER_IDS.GEMINI);
      setKeys({
        [PROVIDER_IDS.GEMINI]: localStorage.getItem('ai-keys.gemini') || '',
        [PROVIDER_IDS.OPENAI]: localStorage.getItem('ai-keys.openai') || '',
        [PROVIDER_IDS.ANTHROPIC]: localStorage.getItem('ai-keys.anthropic') || '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const [connUrl, setConnUrl] = useState(localStorage.getItem(`ai-conn.${provider}`) || '');
  const [connStatus, setConnStatus] = useState('');

  const handleSave = () => {
    setActiveProvider(provider);
    Object.entries(keys).forEach(([p, k]) => saveApiKey(p, k));
    if (connUrl) localStorage.setItem(`ai-conn.${provider}`, connUrl);
    onApplied?.();
    onClose();
  };

  const handleConnect = async () => {
    if (!connUrl) { setConnStatus('Informe a URL de conexão'); return; }
    setConnStatus('Conectando...');
    try {
      await openAuthWindow({ url: connUrl, provider });
      setConnStatus('Conexão concluída');
    } catch (e) {
      setConnStatus(e.message || 'Falha na conexão');
    }
  };

  const renderKeyField = () => {
    if (provider === PROVIDER_IDS.GEMINI) {
      const envKey = (process.env.GEMINI_API_KEY || process.env.API_KEY) ? 'Detectado' : 'Não detectado';
      return React.createElement('div', { className: "space-y-2" },
        React.createElement('label', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Chave Gemini (opcional)"),
        React.createElement('input', {
          type: "password",
          placeholder: "GEMINI_API_KEY",
          value: keys[PROVIDER_IDS.GEMINI],
          onChange: (e) => setKeys({ ...keys, [PROVIDER_IDS.GEMINI]: e.target.value }),
          className: "w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder-gray-600"
        }),
        React.createElement('p', { className: "text-xs text-gray-500" }, `Chave de ambiente: ${envKey}`)
      );
    }
    if (provider === PROVIDER_IDS.OPENAI) {
      return React.createElement('div', { className: "space-y-2" },
        React.createElement('label', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Chave OpenAI"),
        React.createElement('input', {
          type: "password",
          placeholder: "sk-...",
          value: keys[PROVIDER_IDS.OPENAI],
          onChange: (e) => setKeys({ ...keys, [PROVIDER_IDS.OPENAI]: e.target.value }),
          className: "w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder-gray-600"
        })
      );
    }
    if (provider === PROVIDER_IDS.ANTHROPIC) {
      return React.createElement('div', { className: "space-y-2" },
        React.createElement('label', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Chave Anthropic"),
        React.createElement('input', {
          type: "password",
          placeholder: "anthropic-key",
          value: keys[PROVIDER_IDS.ANTHROPIC],
          onChange: (e) => setKeys({ ...keys, [PROVIDER_IDS.ANTHROPIC]: e.target.value }),
          className: "w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder-gray-600"
        })
      );
    }
    return null;
  };

  return React.createElement('div', { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4", onClick: onClose },
    React.createElement('div', { className: "bg-gray-800 rounded-3xl w-full max-w-lg border border-gray-700 overflow-hidden", onClick: (e) => e.stopPropagation() },
      React.createElement('div', { className: "p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800/60" },
        React.createElement('div', { className: "flex items-center gap-3" },
          React.createElement(SettingsIcon, { className: "h-6 w-6 text-indigo-400" }),
          React.createElement('h3', { className: "text-xl font-bold text-white" }, "Configurações de IA")
        ),
        React.createElement('button', { onClick: onClose, className: "text-gray-500 hover:text-white p-1" }, React.createElement(CloseIcon, { className: "h-4 w-4" }))
      ),
      React.createElement('div', { className: "p-6 space-y-6" },
        React.createElement('div', { className: "space-y-2" },
          React.createElement('label', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Provedor"),
          React.createElement('select', {
            value: provider,
            onChange: (e) => { 
              const v = e.target.value;
              setProvider(v);
              setConnUrl(localStorage.getItem(`ai-conn.${v}`) || '');
            },
            className: "w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-3"
          },
            providers.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
          )
        ),
        renderKeyField(),
        React.createElement('div', { className: "rounded-xl border border-gray-700 p-4 bg-gray-900/40 space-y-3" },
          React.createElement('div', { className: "text-xs font-bold text-gray-500 uppercase tracking-wider" }, "Login / Conexão"),
          React.createElement('input', {
            type: "text",
            placeholder: "URL de conexão (ex.: https://seu-auth.example.com/start)",
            value: connUrl,
            onChange: (e) => setConnUrl(e.target.value),
            className: "w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500"
          }),
          React.createElement('div', { className: "flex gap-3 items-center" },
            React.createElement('button', { onClick: handleConnect, className: "bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors" }, "Conectar"),
            React.createElement('span', { className: "text-xs text-gray-400" }, connStatus)
          ),
          React.createElement('p', { className: "text-[11px] text-gray-500" }, "A página de conexão deve enviar window.postMessage({ type: 'TRADEDOCS_AUTH', provider: 'gemini|openai|anthropic', aiKey?: '...', aiToken?: '...' }, window.origin).")
        )
      ),
      React.createElement('div', { className: "p-6 border-t border-gray-700 bg-gray-800/60 flex justify-end gap-3" },
        React.createElement('button', { onClick: onClose, className: "px-6 py-2 text-gray-400 hover:text-white transition-colors font-medium" }, "Cancelar"),
        React.createElement('button', { onClick: handleSave, className: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-xl transition-all" }, "Aplicar")
      )
    )
  );
};

export default AISettingsModal;
