import React from 'react';

const MainLayout = ({ header, banner, children }) =>
  React.createElement('div', { className: "bg-gray-900 min-h-screen text-white font-sans" },
    header || null,
    banner && React.createElement('div', { className: "bg-indigo-950/40 text-indigo-300 text-[10px] font-bold tracking-widest text-center py-2 border-b border-indigo-900/50 flex items-center justify-center gap-3" },
      React.createElement('div', { className: "w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" }),
      banner
    ),
    React.createElement('main', { className: "container mx-auto p-4 md:p-8 animate-fade-in" }, children)
  );

export default MainLayout;
