export const openAuthWindow = ({ url, provider }) => {
  return new Promise((resolve, reject) => {
    try {
      const authUrl = url;
      const expected = (() => {
        try { return new URL(authUrl).origin; } catch { return null; }
      })();
      const win = window.open(authUrl, '_blank', 'width=520,height=640');
      if (!win) {
        reject(new Error('Popup bloqueado pelo navegador'));
        return;
      }
      const onMessage = (ev) => {
        try {
          if (expected && ev.origin !== expected) return;
          const data = ev.data || {};
          if (data && data.type === 'TRADEDOCS_AUTH' && data.provider === provider) {
            if (data.aiKey) {
              localStorage.setItem(`ai-keys.${provider}`, data.aiKey);
              localStorage.removeItem(`ai-tokens.${provider}`);
            } else if (data.aiToken) {
              localStorage.setItem(`ai-tokens.${provider}`, data.aiToken);
            }
            window.removeEventListener('message', onMessage);
            try { win.close(); } catch {}
            resolve({ kind: data.aiKey ? 'key' : 'token' });
          }
        } catch {}
      };
      window.addEventListener('message', onMessage);
      const poll = setInterval(() => {
        if (win.closed) {
          clearInterval(poll);
          window.removeEventListener('message', onMessage);
          reject(new Error('Janela de login fechada'));
        }
      }, 500);
    } catch (e) {
      reject(e);
    }
  });
};

