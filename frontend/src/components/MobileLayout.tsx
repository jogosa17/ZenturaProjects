import React, { useState, useEffect } from 'react';
import Layout from './layout/Layout';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Si no es móvil, usar el layout original
  if (!isMobile) {
    return <Layout>{children}</Layout>;
  }

  // Si es móvil, mostrar una vista de placeholder ya que necesitamos implementar la navegación
  return (
    <div className="min-h-screen bg-zentura-light">
      <div className="zentura-header">
        <h1 className="text-xl font-semibold">Vista Móvil</h1>
        <p className="text-blue-100 text-sm mt-1">Navegación en desarrollo</p>
      </div>
      
      <div className="p-4">
        <div className="zentura-card">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Contenido de la Página</h2>
          <p className="text-gray-600">
            Esta es la versión móvil de la aplicación. El contenido específico de cada página 
            se mostrará aquí cuando implementemos la navegación completa.
          </p>
        </div>
        
        <div className="mt-4">
          <div className="zentura-card">
            <h3 className="font-medium text-gray-800 mb-2">Contenido Original:</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación Inferior */}
      <div className="zentura-bottom-nav">
        <div className="flex justify-around">
          <button className="zentura-nav-item active">
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

export default MobileLayout;
