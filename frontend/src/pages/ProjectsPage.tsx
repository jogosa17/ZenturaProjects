import React, { useState, useEffect } from 'react';
import ProjectsTable from '../components/ProjectsTable';
import ProjectForm from '../components/ProjectForm';
import ProjectService, { Project, CreateProjectDto } from '../services/project.service';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const result = await ProjectService.getProjects();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError('Error al cargar la lista de proyectos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el proyecto "${project.name}"?`)) {
      try {
        await ProjectService.deleteProject(project.id);
        fetchProjects();
      } catch (err) {
        console.error('Error al eliminar proyecto:', err);
        alert('Error al eliminar el proyecto');
      }
    }
  };

  const handleFormSubmit = async (data: CreateProjectDto) => {
    try {
      if (editingProject) {
        await ProjectService.updateProject(editingProject.id, data);
      } else {
        await ProjectService.createProject(data);
      }
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      alert('Error al guardar el proyecto');
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Gestión de Proyectos</h1>
        <button className="btn-create" onClick={handleCreateProject}>
          + Nuevo Proyecto
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <ProjectsTable 
        projects={projects}
        loading={loading}
        onEdit={handleEditProject} 
        onDelete={handleDeleteProject}
      />

      {showForm && (
        <ProjectForm
          initialData={editingProject}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
