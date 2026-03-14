import React, { useState } from 'react';

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MobileProjects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const projects = [
    {
      id: 1,
      name: 'Reforma El Saler',
      client: 'Juan Pérez',
      status: 'INICIADO',
      statusColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 2,
      name: 'Reforma Cocina Moderna',
      client: 'María García',
      status: 'EN PROGRESO',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 3,
      name: 'Baño Principal',
      client: 'Carlos López',
      status: 'PENDIENTE',
      statusColor: 'bg-gray-100 text-gray-700'
    },
    {
      id: 4,
      name: 'Sala de Estar',
      client: 'Ana Martínez',
      status: 'COMPLETADO',
      statusColor: 'bg-green-100 text-green-700'
    }
  ];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zentura-light pb-20">
      {/* Header */}
      <div className="zentura-header">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Proyectos</h1>
          <button className="bg-white text-zentura-blue px-3 py-1 rounded-lg text-sm font-medium">
            + Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="zentura-input w-full pl-10"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Lista de Proyectos */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="zentura-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-zentura-blue text-lg">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {project.client}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`zentura-badge text-xs ${project.statusColor}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                <button className="p-2 text-gray-500 hover:text-zentura-blue transition-colors">
                  <EditIcon />
                </button>
                <button className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navegación Inferior */}
      <div className="zentura-bottom-nav">
        <div className="flex justify-around">
          <button className="zentura-nav-item text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          
          <button className="zentura-nav-item text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs mt-1">Usuarios</span>
          </button>
          
          <button className="zentura-nav-item text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Clientes</span>
          </button>
          
          <button className="zentura-nav-item active">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-xs mt-1">Proyectos</span>
          </button>
          
          <button className="zentura-nav-item text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">Agenda</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileProjects;
