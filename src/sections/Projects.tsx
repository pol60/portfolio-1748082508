import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ProjectCard from "../components/ProjectCard";
import { useProjects } from "../hooks/useProjects";
import { Link } from "react-router-dom";

const Projects: React.FC = () => {
  const { t } = useTranslation();
  const { projects, loading, error } = useProjects();
  const [showTapChanceModal, setShowTapChanceModal] = useState(false);

  return (
    <section id="projects" className="py-20 min-h-screen flex items-center">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {t("projects.title")}
            </span>
          </h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-4">
            {t("projects.description")}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <div className="text-red-500 mb-4">
              <i className="fas fa-exclamation-triangle text-3xl"></i>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {t("projects.loading_error")}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDemoClick={project.id === 4 ? () => setShowTapChanceModal(true) : undefined}
                disableAnimation={project.id === 4 && showTapChanceModal}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/projects"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50 !rounded-button whitespace-nowrap cursor-pointer inline-block"
          >
            {t("projects.view_all")} <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
      {/* Модалка Tap Chance вне карточки */}
      {showTapChanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg max-w-lg w-full text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl"
              onClick={() => setShowTapChanceModal(false)}
              aria-label="Закрыть"
            >
              &times;
            </button>
            <img
              src="https://i.postimg.cc/3JvMJVG1/IMG-2119.png"
              alt="Tap Chance Preview"
              className="mx-auto mb-4 rounded-lg w-full max-w-[400px] object-contain border-4 border-indigo-500"
              style={{ maxHeight: '70vh' }}
            />
            <h3 className="text-lg font-bold mb-2">Связаться с автором</h3>
            <p className="mb-4 text-indigo-600 font-semibold">@Yemelianenko_003</p>
            <a
              href="https://t.me/Yemelianenko_003"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition"
            >
              Открыть Telegram
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
