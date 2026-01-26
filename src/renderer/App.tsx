import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProjectListPage } from "../pages/ProjectListPage";
import { ProjectFormPage } from "../pages/ProjectFormPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProjectListPage />} />
          <Route path="projects/new" element={<ProjectFormPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="projects/:id/edit" element={<ProjectFormPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
