import React from 'react';

interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, setDarkMode }) => {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
      aria-label="Переключить тему"
    >
      {darkMode ? (
        <i className="fas fa-sun text-yellow-400"></i>
      ) : (
        <i className="fas fa-moon text-indigo-600"></i>
      )}
    </button>
  );
};

export default ThemeToggle;
