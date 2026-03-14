import React, { useState, useEffect } from 'react';
import ClientsTable from '../components/ClientsTable';
import ClientForm from '../components/ClientForm';
import ClientProjectsModal from '../components/ClientProjectsModal';
import ClientService, { Client, CreateClientDto } from '../services/client.service';
import ProjectService, { Project } from '../services/project.service';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const result = await ClientService.getClients();
      if (result.success) {
        setClients(result.data);
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al cliente "${client.name}"?`)) {
      try {
        await ClientService.deleteClient(client.id);
        fetchClients(); // Recargar lista
      } catch (err) {
        console.error('Error al eliminar cliente:', err);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const handleViewProjects = async (client: Client) => {
    setSelectedClient(client);
    setShowProjectsModal(true);
    setProjectsLoading(true);
    
    try {
      const result = await ProjectService.getProjectsByClient(client.id);
      if (result.success) {
        setClientProjects(result.data);
      }
    } catch (err) {
      console.error('Error al cargar proyectos del cliente:', err);
      alert('Error al cargar los proyectos del cliente');
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleFormSubmit = async (data: CreateClientDto) => {
    try {
      console.log('🔍 Guardando datos del cliente:', data);
      
      if (editingClient) {
        console.log('📝 Actualizando cliente existente:', editingClient.id);
        const result = await ClientService.updateClient(editingClient.id, data);
        if (result.success) {
          console.log('✅ Cliente actualizado correctamente');
          setShowForm(false);
          setEditingClient(null);
          // Recargar la lista de clientes para reflejar los cambios
          await fetchClients();
        } else {
          console.error('❌ Error al actualizar cliente:', result.message);
          alert('Error al actualizar el cliente: ' + result.message);
        }
      } else {
        console.log('📝 Creando nuevo cliente');
        const result = await ClientService.createClient(data);
        if (result.success) {
          console.log('✅ Cliente creado correctamente');
          setShowForm(false);
          // Recargar la lista para mostrar el nuevo cliente
          await fetchClients();
        } else {
          console.error('❌ Error al crear cliente:', result.message);
          alert('Error al crear el cliente: ' + result.message);
        }
      }
    } catch (error) {
      console.error('❌ Error en handleFormSubmit:', error);
      alert('Error al guardar el cliente');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Gestión de Clientes</h1>
        <button className="btn-create" onClick={handleCreateClient}>
          + Nuevo Cliente
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <ClientsTable 
        clients={clients}
        loading={loading}
        onEdit={handleEditClient} 
        onDelete={handleDeleteClient}
        onViewProjects={handleViewProjects}
      />

      {showForm && (
        <ClientForm
          initialData={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showProjectsModal && (
        <ClientProjectsModal
          isOpen={showProjectsModal}
          onClose={() => {
            setShowProjectsModal(false);
            setSelectedClient(null);
            setClientProjects([]);
          }}
          client={selectedClient}
          projects={clientProjects}
          loading={projectsLoading}
        />
      )}
    </>
  );
};

export default ClientsPage;
