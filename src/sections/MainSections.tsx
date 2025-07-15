import React, { useRef } from "react";
import Home from "./Home";
import About from "./About";
import Skills from "./Skills";
import Projects from "./Projects";
import Contact from "./Contact";

const MainSections: React.FC = () => {
  const skillChartRef = useRef<HTMLDivElement>(null);
  const experienceChartRef = useRef<HTMLDivElement>(null);

  // scrollToSection можно реализовать здесь, если нужно

  return (
    <>
      <Home />
      <About />
      <Skills skillChartRef={skillChartRef} experienceChartRef={experienceChartRef} />
      <Projects />
      <Contact />
    </>
  );
};

export default MainSections; 