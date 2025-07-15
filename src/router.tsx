// src/router.tsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./sections/Home";
import About from "./sections/About";
import AllProjects from "./sections/AllProjects";
import MainSections from "./sections/MainSections";

// Здесь мы создаём браузерный роутер с корневым путём "/"
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Этот компонент должен содержать <Outlet />, куда будут рендериться дочерние маршруты
    children: [
      {
        index: true, // при заходе на "/", рендерятся все секции
        element: <MainSections />,
      },
      {
        path: "about", // при заходе на "/about", рендерится About
        element: <About />,
      },
      {
        path: "projects", // при заходе на "/projects", рендерится AllProjects
        element: <AllProjects />,
      },
    ],
  },
]);

export default router;
