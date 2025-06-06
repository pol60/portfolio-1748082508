import React, { useEffect, useRef, useState } from "react";
import projectImages from "../../public/projects/projectImages.json";

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  technologies: string[];
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const projectImage = projectImages[String(project.id) as keyof typeof projectImages];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (descriptionRef.current) {
      observer.observe(descriptionRef.current);
    }

    return () => {
      if (descriptionRef.current) {
        observer.unobserve(descriptionRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-105 flex flex-col h-[480px]">
      <div 
        ref={imageRef}
        className="relative h-[200px] flex-shrink-0 overflow-hidden"
      >
        <img
          src={projectImage.image}
          alt={project.title}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${
            isVisible ? "opacity-0 scale-110" : "opacity-100 scale-100"
          }`}
        />
        <img
          src={projectImage.previewImage}
          alt={`${project.title} preview`}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-110"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-6">
            <span className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full">
              {project.category}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2">
            {project.title}
          </h3>
        </div>
        <div className="mb-4 flex-grow">
          <p 
            ref={descriptionRef}
            className="text-gray-600 dark:text-gray-300 line-clamp-4 text-sm"
          >
            {project.description}
          </p>
        </div>
        <div className="mb-4">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full whitespace-nowrap"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between  p-4 border-t border-gray-200 dark:border-gray-700 h-[20px]">
          <a
            href={projectImage.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-medium cursor-pointer"
          >
            Демо <i className="fas fa-external-link-alt ml-1"></i>
          </a>
          <a
            href={projectImage.githubUrl}
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
