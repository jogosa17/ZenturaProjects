import React, { useState, useEffect } from 'react';
import ClientsTable from '../components/ClientsTable';
import ClientForm from '../components/ClientForm';
import ClientService, { Client, CreateClientDto } from '../services/client.service';
import './ClientsPage.css';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleFormSubmit = async (data: CreateClientDto) => {
    try {
      if (editingClient) {
        await ClientService.updateClient(editingClient.id, data);
      } else {
        await ClientService.createClient(data);
      }
      setShowForm(false);
      fetchClients();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  return (
    <div className="clients-page">
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
      />

      {showForm && (
        <ClientForm
          initialData={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ClientsPage;
