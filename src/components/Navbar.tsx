import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

interface NavbarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  scrollToSection,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  const { t } = useTranslation();

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${activeSection !== "home" ? "bg-gray-900/80 backdrop-blur-md shadow-md" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <nav className="hidden md:flex items-center space-x-8">
          {["home", "about", "skills", "projects", "contact"].map((section) => (
            <a
              key={section}
              href={`#${section}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(section);
              }}
              className={`relative py-2 text-sm uppercase tracking-wider font-medium cursor-pointer transition-colors ${
                activeSection === section
                  ? "text-indigo-600"
                  : "text-gray-300 hover:text-indigo-400"
              }`}
            >
              {t(`nav.${section}`)}
              {activeSection === section && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform origin-left transition-transform duration-300"></span>
              )}
            </a>
          ))}
        </nav>

        {/* Блок с иконками */}
        <div className="hidden md:flex items-center space-x-6 ml-auto">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fab fa-react text-blue-400 text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fab fa-node-js text-green-500 text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fab fa-js text-yellow-400 text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fab fa-python text-blue-500 text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-database text-pink-600 text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fab fa-css3-alt text-blue-400 text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fab fa-github text-gray-300 text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="devicon-typescript-plain colored text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fab fa-npm text-red-600 text-xl"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="devicon-vitejs-plain colored text-xl"></i>
            </div>
          </div>
        </div>

        {/* Кнопки справа */}
        <div className="flex items-center space-x-4 ml-auto">
          <LanguageSelector />
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t("nav.menu")}
          >
            {isMenuOpen ? (
              <i className="fas fa-times text-indigo-600"></i>
            ) : (
              <i className="fas fa-bars text-indigo-600"></i>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
