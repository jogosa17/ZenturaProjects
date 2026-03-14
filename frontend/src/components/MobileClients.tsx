import React, { useState } from 'react';

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MobileClients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const clients = [
    {
      id: 1,
      name: 'Juan Pérez',
      phone: '+34 600 123 456',
      email: 'juan.perez@email.com',
      projects: 2,
      initials: 'JP'
    },
    {
      id: 2,
      name: 'María García',
      phone: '+34 600 234 567',
      email: 'maria.garcia@email.com',
      projects: 1,
      initials: 'MG'
    },
    {
      id: 3,
      name: 'Carlos López',
      phone: '+34 600 345 678',
      email: 'carlos.lopez@email.com',
      projects: 3,
      initials: 'CL'
    },
    {
      id: 4,
      name: 'Ana Martínez',
      phone: '+34 600 456 789',
      email: 'ana.martinez@email.com',
      projects: 1,
      initials: 'AM'
    },
    {
      id: 5,
      name: 'Roberto Sánchez',
      phone: '+34 600 567 890',
      email: 'roberto.sanchez@email.com',
      projects: 2,
      initials: 'RS'
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-zentura-light pb-20">
      {/* Header */}
      <div className="zentura-header">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Clientes</h1>
          <button className="bg-white text-zentura-blue px-3 py-1 rounded-lg text-sm font-medium">
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="zentura-input w-full pl-10"
          />
          <div className="absolute left-3 top-2.5">
            <SearchIcon />
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="zentura-card">
              <div className="flex items-center space-x-3">
                {/* Avatar Circular */}
                <div className="w-12 h-12 bg-zentura-blue rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(client.name)}
                </div>
                
                {/* Información del Cliente */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {client.projects} {client.projects === 1 ? 'proyecto' : 'proyectos'}
                  </p>
                </div>
                
                {/* Botón de Acción Rápida */}
                <button className="p-2 bg-zentura-blue text-white rounded-full hover:bg-blue-600 transition-colors">
                  <PhoneIcon />
                </button>
              </div>
              
              {/* Información Adicional */}
              <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                <p>{client.email}</p>
                <p>{client.phone}</p>
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
          
          <button className="zentura-nav-item active">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Clientes</span>
          </button>
          
          <button className="zentura-nav-item text-gray-500">
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

export default MobileClients;
