import React from 'react';
import { Client } from '../services/client.service';
import './ClientsTable.css';

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewProjects?: (client: Client) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({ 
  clients, 
  loading, 
  onEdit, 
  onDelete,
  onViewProjects 
}) => {
  if (loading) {
    return <div className="loading-container">Cargando clientes...</div>;
  }

  return (
    <div className="projects-table-container">
      <table className="projects-table" style={{ minWidth: '700px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Proyectos</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">No hay clientes registrados</td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.dni_cif || '-'}</td>
                <td>
                  <a 
                    href={`tel:${client.phone}`} 
                    className="phone-link"
                    title="Llamar al cliente"
                  >
                    📞 {client.phone}
                  </a>
                </td>
                <td>
                  <span className="badge">
                    {(client.project_count || 0) === 1 
                      ? '1 PROYECTO' 
                      : (client.project_count || 0) > 1 
                        ? `${client.project_count || 0} PROYECTOS`
                        : '0 PROYECTOS'
                    }
                  </span>
                </td>
                <td>{new Date(client.created_at || '').toLocaleDateString()}</td>
                <td>
                  <div className="actions-cell">
                    <button 
                      onClick={() => onViewProjects && onViewProjects(client)}
                      className="btn-view"
                      title="Ver proyectos del cliente"
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => onEdit(client)}
                      className="btn-edit"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => onDelete(client)}
                      className="btn-delete"
                      disabled={(client.project_count || 0) > 0}
                      title={(client.project_count || 0) > 0 ? "No se puede eliminar clientes con proyectos activos" : "Eliminar cliente"}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsTable;
