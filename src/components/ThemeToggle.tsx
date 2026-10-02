'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('motorlink-theme');
    if (storedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('motorlink-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('motorlink-theme', 'light');
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-blue-100/50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center opacity-60" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Alternar para Modo Claro (Azul SENAI)' : 'Alternar para Modo Escuro (Azul Noturno)'}
      title={isDark ? 'Mudar para Tema Claro SENAI' : 'Mudar para Tema Escuro SENAI'}
      className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100/80 hover:bg-blue-200/90 text-blue-900 border border-blue-200 shadow-sm transition-all duration-200 dark:bg-blue-950/70 dark:hover:bg-blue-900/80 dark:text-blue-300 dark:border-blue-800/80 hover:scale-105 active:scale-95"
    >
      {isDark ? (
        <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#005caa] group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
