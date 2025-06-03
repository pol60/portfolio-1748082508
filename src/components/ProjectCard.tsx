import React from "react";

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  demoUrl: string;
  githubUrl: string;
  technologies: string[];
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-105 flex flex-col h-[480px]">
      <div className="relative h-[200px] flex-shrink-0">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 hover:transform hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-6">
            <span className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full">
              {project.category}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2">
            {project.title}
          </h3>
        </div>
        <div className="mb-4 flex-1">
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
            {project.description}
          </p>
        </div>
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-medium cursor-pointer"
          >
            Демо <i className="fas fa-external-link-alt ml-1"></i>
          </a>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-medium cursor-pointer"
          >
            GitHub <i className="fab fa-github ml-1"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
