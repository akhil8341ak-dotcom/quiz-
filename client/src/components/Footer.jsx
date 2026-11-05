import React from 'react';
import { Brain, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Brain className="w-4 h-4 text-blue-600" />
          <span>QuizCraft</span>
          <span className="text-slate-400 font-normal">&bull; Peer-Created Practice Quiz Bank</span>
        </div>
        <div className="text-xs text-slate-500">
          Engineered with intelligent Weak Topics detection for mastery-based learning.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
