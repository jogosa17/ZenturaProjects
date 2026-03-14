import React, { useState, useEffect } from 'react';
import './WorkerAssignment.css';

interface Worker {
  id: number;
  name: string;
  email: string;
  username?: string;
  assigned_at?: string;
}

interface WorkerAssignmentProps {
  projectId: number;
  projectName: string;
  userRole: string;
  onAssignmentChange?: () => void;
}

const WorkerAssignment: React.FC<WorkerAssignmentProps> = ({ 
  projectId, 
  projectName, 
  userRole, 
  onAssignmentChange 
}) => {
  const API_URL = 'http://localhost:3001';
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [assignedWorkers, setAssignedWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Solo admins pueden usar este componente
    if (userRole !== 'admin') {
      return;
    }
    
    fetchWorkers();
  }, [projectId, userRole]);

  const fetchWorkers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/assignments/projects/${projectId}/workers/available`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAvailableWorkers(data.data.available);
        setAssignedWorkers(data.data.assigned);
      } else {
        setError(data.message || 'Error al cargar trabajadores');
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const assignWorker = async (workerId: number) => {
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/assignments/projects/${projectId}/workers/${workerId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        
        // Mover worker de disponibles a asignados
        const worker = availableWorkers.find(w => w.id === workerId);
        if (worker) {
          setAvailableWorkers(prev => prev.filter(w => w.id !== workerId));
          setAssignedWorkers(prev => [...prev, { ...worker, assigned_at: new Date().toISOString() }]);
        }
        
        if (onAssignmentChange) {
          onAssignmentChange();
        }
      } else {
        setError(data.message || 'Error al asignar trabajador');
      }
    } catch (error) {
      console.error('Error assigning worker:', error);
      setError('Error de conexión al servidor');
    }
  };

  const unassignWorker = async (workerId: number) => {
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/assignments/projects/${projectId}/workers/${workerId}/unassign`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        
        // Mover worker de asignados a disponibles
        const worker = assignedWorkers.find(w => w.id === workerId);
        if (worker) {
          const { assigned_at, ...workerWithoutAssignment } = worker;
          setAssignedWorkers(prev => prev.filter(w => w.id !== workerId));
          setAvailableWorkers(prev => [...prev, workerWithoutAssignment].sort((a, b) => a.name.localeCompare(b.name)));
        }
        
        if (onAssignmentChange) {
          onAssignmentChange();
        }
      } else {
        setError(data.message || 'Error al desasignar trabajador');
      }
    } catch (error) {
      console.error('Error unassigning worker:', error);
      setError('Error de conexión al servidor');
    }
  };

  // Solo admins pueden ver este componente
  if (userRole !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="worker-assignment">
        <div className="loading">Cargando trabajadores...</div>
      </div>
    );
  }

  return (
    <div className="worker-assignment">
      <div className="assignment-header">
        <h3>👥 Gestión de Trabajadores</h3>
        <p>Proyecto: <strong>{projectName}</strong></p>
      </div>

      {error && (
        <div className="message error">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="message success">
          ✅ {success}
        </div>
      )}

      <div className="assignment-content">
        <div className="workers-section">
          <h4>📋 Trabajadores Disponibles ({availableWorkers.length})</h4>
          <div className="workers-list">
            {availableWorkers.length === 0 ? (
              <p className="no-workers">No hay trabajadores disponibles</p>
            ) : (
              availableWorkers.map(worker => (
                <div key={worker.id} className="worker-item available">
                  <div className="worker-info">
                    <div className="worker-name">{worker.name}</div>
                    <div className="worker-email">{worker.email}</div>
                    {worker.username && (
                      <div className="worker-username">@{worker.username}</div>
                    )}
                  </div>
                  <button
                    className="assign-btn"
                    onClick={() => assignWorker(worker.id)}
                    title="Asignar al proyecto"
                  >
                    ➕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="workers-section">
          <h4>✅ Trabajadores Asignados ({assignedWorkers.length})</h4>
          <div className="workers-list">
            {assignedWorkers.length === 0 ? (
              <p className="no-workers">No hay trabajadores asignados</p>
            ) : (
              assignedWorkers.map(worker => (
                <div key={worker.id} className="worker-item assigned">
                  <div className="worker-info">
                    <div className="worker-name">{worker.name}</div>
                    <div className="worker-email">{worker.email}</div>
                    {worker.username && (
                      <div className="worker-username">@{worker.username}</div>
                    )}
                    {worker.assigned_at && (
                      <div className="assignment-date">
                        Asignado: {new Date(worker.assigned_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button
                    className="unassign-btn"
                    onClick={() => unassignWorker(worker.id)}
                    title="Desasignar del proyecto"
                  >
                    ➖
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerAssignment;
