import React from 'react';
import { Brain, Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-dark-border/80 bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-white font-heading font-bold text-sm">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-electric text-white flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4" />
          </div>
          <span>QuizCraft</span>
          <span className="text-slate-400 dark:text-dark-textMuted font-normal">
            &bull; Peer-Created Practice Quiz Bank
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-dark-textMuted">
          <Sparkles className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
          <span>Algorithmic Weak Topics Blitz for targeted revision</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
