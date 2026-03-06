import React, { useState, useEffect } from 'react';
import ZoneService, { Zone } from '../services/zone.service';
import TasksManager from './TasksManager';
import './ZonesManager.css';

interface ZonesManagerProps {
  projectId: number;
  onTasksChange?: () => void;
}

const ZonesManager: React.FC<ZonesManagerProps> = ({ projectId, onTasksChange }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);
  const [editZoneName, setEditZoneName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const result = await ZoneService.getZonesByProject(projectId);
      if (result.success) {
        setZones(result.data);
      }
    } catch (err) {
      console.error('Error al cargar zonas:', err);
      setError('Error al cargar las zonas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchZones();
    }
  }, [projectId]);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    try {
      await ZoneService.createZone({
        project_id: projectId,
        name: newZoneName
      });
      setNewZoneName('');
      fetchZones();
    } catch (err) {
      console.error('Error al crear zona:', err);
      alert('Error al crear la zona');
    }
  };

  const handleStartEdit = (zone: Zone) => {
    setEditingZoneId(zone.id);
    setEditZoneName(zone.name);
  };

  const handleCancelEdit = () => {
    setEditingZoneId(null);
    setEditZoneName('');
  };

  const handleUpdateZone = async (id: number) => {
    if (!editZoneName.trim()) return;

    try {
      await ZoneService.updateZone(id, { name: editZoneName });
      setEditingZoneId(null);
      fetchZones();
    } catch (err) {
      console.error('Error al actualizar zona:', err);
      alert('Error al actualizar la zona');
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta zona?')) {
      try {
        await ZoneService.deleteZone(id);
        fetchZones();
      } catch (err: any) {
        console.error('Error al eliminar zona:', err);
        if (err.response && err.response.data && err.response.data.message) {
             alert(err.response.data.message);
        } else {
             alert('Error al eliminar la zona');
        }
      }
    }
  };

  if (loading && zones.length === 0) return <div>Cargando zonas...</div>;

  return (
    <div className="zones-manager">
      <div className="zones-header">
        <h3>Zonas de Trabajo</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleCreateZone} className="add-zone-form">
        <input
          type="text"
          placeholder="Nombre de la nueva zona"
          value={newZoneName}
          onChange={(e) => setNewZoneName(e.target.value)}
          className="zone-input"
        />
        <button type="submit" className="btn-add-zone" disabled={!newZoneName.trim()}>
          + Agregar Zona
        </button>
      </form>

      <div className="zones-list">
        {zones.length === 0 ? (
          <p className="no-zones">No hay zonas definidas para este proyecto.</p>
        ) : (
          zones.map((zone) => (
            <div key={zone.id} className="zone-item">
              {editingZoneId === zone.id ? (
                <div className="zone-edit-mode">
                  <input
                    type="text"
                    value={editZoneName}
                    onChange={(e) => setEditZoneName(e.target.value)}
                    className="zone-input-edit"
                  />
                  <div className="zone-actions">
                    <button onClick={() => handleUpdateZone(zone.id)} className="btn-save">
                      💾
                    </button>
                    <button onClick={handleCancelEdit} className="btn-cancel-edit">
                      ❌
                    </button>
                  </div>
                </div>
              ) : (
                <div className="zone-view-mode">
                  <span className="zone-name">{zone.name}</span>
                  <div className="zone-actions">
                    <button onClick={() => handleStartEdit(zone)} className="btn-edit-zone" title="Editar">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteZone(zone.id)} className="btn-delete-zone" title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </div>
              )}
              
              <TasksManager zoneId={zone.id} onTasksChange={onTasksChange} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ZonesManager;
