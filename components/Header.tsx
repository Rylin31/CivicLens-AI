
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        CivicLens AI
      </h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        Get concise, factual, and balanced insights from any news article or policy text.
        Powered by AI to help you see clearly.
      </p>
    </header>
  );
};

export default Header;
