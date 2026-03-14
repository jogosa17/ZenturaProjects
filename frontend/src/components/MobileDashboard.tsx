import React from 'react';

const MobileDashboard: React.FC = () => {
  const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const FolderIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const stats = [
    {
      icon: <FolderIcon />,
      number: '12',
      label: 'Proyectos Activos',
      color: 'text-blue-600'
    },
    {
      icon: <UserIcon />,
      number: '45',
      label: 'Clientes Totales',
      color: 'text-green-600'
    },
    {
      icon: <CalendarIcon />,
      number: '8',
      label: 'Tareas Pendientes',
      color: 'text-orange-600'
    },
    {
      icon: <UsersIcon />,
      number: '23',
      label: 'Usuarios Activos',
      color: 'text-purple-600'
    }
  ];

  const navItems = [
    { icon: <HomeIcon />, label: 'Dashboard', active: true },
    { icon: <UsersIcon />, label: 'Usuarios', active: false },
    { icon: <UserIcon />, label: 'Clientes', active: false },
    { icon: <FolderIcon />, label: 'Proyectos', active: false },
    { icon: <CalendarIcon />, label: 'Agenda', active: false }
  ];

  return (
    <div className="min-h-screen bg-zentura-light pb-20">
      {/* Header */}
      <div className="zentura-header">
        <h1 className="text-xl font-semibold">Hola, Admin A5724</h1>
        <p className="text-blue-100 text-sm mt-1">Bienvenido a tu panel</p>
      </div>

      {/* Cuerpo - Grid de Estadísticas */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="zentura-card">
              <div className="flex items-center justify-between mb-2">
                {stat.icon}
                <span className="text-xs text-gray-500">Hoy</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Sección de Actividad Reciente */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Actividad Reciente</h2>
          <div className="space-y-3">
            <div className="zentura-card">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Nueva tarea creada</p>
                  <p className="text-xs text-gray-500">Reforma El Saler - Hace 5 min</p>
                </div>
              </div>
            </div>
            <div className="zentura-card">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Cliente agregado</p>
                  <p className="text-xs text-gray-500">María García - Hace 1 hora</p>
                </div>
              </div>
            </div>
            <div className="zentura-card">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Proyecto actualizado</p>
                  <p className="text-xs text-gray-500">Reforma Cocina - Hace 2 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="zentura-button text-sm">
              + Nuevo Proyecto
            </button>
            <button className="zentura-button-outline text-sm">
              + Agregar Cliente
            </button>
          </div>
        </div>
      </div>

      {/* Navegación Inferior */}
      <div className="zentura-bottom-nav">
        <div className="flex justify-around">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`zentura-nav-item ${item.active ? 'active' : 'text-gray-500'}`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
