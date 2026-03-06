import React, { useState, useEffect } from 'react';
import TaskService, { Task, CreateTaskDto, UpdateTaskDto } from '../services/task.service';
import NotesManager from './NotesManager';
import './TasksManager.css';

interface TasksManagerProps {
  zoneId: number;
  onTasksChange?: () => void;
}

const TasksManager: React.FC<TasksManagerProps> = ({ zoneId, onTasksChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPrice, setNewTaskPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Estado para edición
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UpdateTaskDto>({});
  
  // Estado para notas
  const [expandedNotesTaskId, setExpandedNotesTaskId] = useState<number | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const result = await TaskService.getTasksByZone(zoneId);
      if (result.success) {
        setTasks(result.data);
      }
    } catch (err) {
      console.error('Error al cargar tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (zoneId) {
      fetchTasks();
    }
  }, [zoneId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    try {
      await TaskService.createTask({
        zone_id: zoneId,
        name: newTaskName,
        price: newTaskPrice ? parseFloat(newTaskPrice) : 0,
        priority: 0 // Default Baja
      });
      setNewTaskName('');
      setNewTaskPrice('');
      setShowAddForm(false);
      fetchTasks();
      if (onTasksChange) onTasksChange();
    } catch (err) {
      console.error('Error al crear tarea:', err);
      alert('Error al crear la tarea');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('¿Eliminar tarea?')) {
      try {
        await TaskService.deleteTask(id);
        fetchTasks();
        if (onTasksChange) onTasksChange();
      } catch (err) {
        console.error('Error al eliminar tarea:', err);
      }
    }
  };

  const handleStatusChange = async (task: Task, newStatus: 'pending' | 'in_progress' | 'finished') => {
    try {
      await TaskService.updateTask(task.id, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handlePriorityChange = async (task: Task, newPriority: number) => {
    try {
      await TaskService.updateTask(task.id, { priority: newPriority });
      fetchTasks();
    } catch (err) {
      console.error('Error al actualizar prioridad:', err);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditForm({
      name: task.name,
      price: task.price,
      description: task.description || '',
      notes: task.notes || ''
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditForm({});
  };

  const saveEditing = async (id: number) => {
    try {
      await TaskService.updateTask(id, editForm);
      setEditingTaskId(null);
      fetchTasks();
      if (onTasksChange) onTasksChange();
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      alert('Error al guardar cambios');
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En curso';
      case 'finished': return 'Finalizada';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch(priority) {
      case 2: return 'Alta';
      case 1: return 'Media';
      default: return 'Baja';
    }
  };

  if (loading && tasks.length === 0) return <div className="loading-tasks">Cargando tareas...</div>;

  return (
    <div className="tasks-manager">
      <div className="tasks-header">
        <button 
          className="btn-add-task-toggle"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '- Cancelar' : '+ Nueva Tarea'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateTask} className="task-form">
          <input
            type="text"
            placeholder="Nombre de la tarea"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="task-input name-input"
            autoFocus
            required
          />
          <input
            type="number"
            placeholder="Precio (€)"
            value={newTaskPrice}
            onChange={(e) => setNewTaskPrice(e.target.value)}
            className="task-input price-input"
            min="0"
            step="0.01"
          />
          <button type="submit" className="btn-save-task">Guardar</button>
        </form>
      )}

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No hay tareas en esta zona.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={`task-item status-${task.status} priority-${task.priority}`}>
              {editingTaskId === task.id ? (
                <div className="task-edit-mode">
                   <div className="edit-row">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="edit-input"
                      placeholder="Nombre"
                    />
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                      className="edit-input price"
                      placeholder="Precio"
                    />
                   </div>
                   <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="edit-textarea"
                      placeholder="Descripción"
                   />
                   <div className="edit-actions">
                     <button onClick={() => saveEditing(task.id)} className="btn-confirm">Guardar</button>
                     <button onClick={cancelEditing} className="btn-cancel">Cancelar</button>
                   </div>
                </div>
              ) : (
                <div className="task-view-mode">
                  <div className="task-main-info">
                    <div className="task-header-row">
                      <span className="task-name">{task.name}</span>
                      <span className="task-price">{task.price > 0 ? `${task.price} €` : '-'}</span>
                    </div>
                    {task.description && <p className="task-desc">{task.description}</p>}
                    
                    <div className="task-meta">
                      <div className="status-controls">
                        <select 
                          value={task.status} 
                          onChange={(e) => handleStatusChange(task, e.target.value as any)}
                          className={`status-select status-${task.status}`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_progress">En curso</option>
                          <option value="finished">Finalizada</option>
                        </select>
                      </div>

                      <div className="priority-controls">
                        <select 
                          value={task.priority} 
                          onChange={(e) => handlePriorityChange(task, parseInt(e.target.value))}
                          className={`priority-select priority-${task.priority}`}
                        >
                          <option value={0}>Baja</option>
                          <option value={1}>Media</option>
                          <option value={2}>Alta</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button onClick={() => startEditing(task)} className="btn-icon" title="Editar">✏️</button>
                    <button 
                      onClick={() => setExpandedNotesTaskId(expandedNotesTaskId === task.id ? null : task.id)} 
                      className={`btn-icon ${expandedNotesTaskId === task.id ? 'active' : ''}`}
                      title="Notas"
                    >
                      💬
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} className="btn-icon delete" title="Eliminar">🗑️</button>
                  </div>
                </div>
              )}
              
              {expandedNotesTaskId === task.id && (
                <NotesManager taskId={task.id} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksManager;
