import React, { useState, useEffect } from 'react';
import NoteService, { Note } from '../services/note.service';
import './NotesManager.css';

interface NotesManagerProps {
  taskId: number;
}

const NotesManager: React.FC<NotesManagerProps> = ({ taskId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const result = await NoteService.getNotesByTask(taskId);
      if (result.success) {
        setNotes(result.data);
      }
    } catch (err) {
      console.error('Error al cargar notas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchNotes();
    }
  }, [taskId]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await NoteService.createNote({
        task_id: taskId,
        note: newNote
      });
      setNewNote('');
      fetchNotes();
    } catch (err) {
      console.error('Error al crear nota:', err);
      alert('Error al crear la nota');
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (window.confirm('¿Eliminar nota?')) {
      try {
        await NoteService.deleteNote(id);
        fetchNotes();
      } catch (err) {
        console.error('Error al eliminar nota:', err);
        alert('Error al eliminar la nota (solo puedes borrar tus propias notas)');
      }
    }
  };

  return (
    <div className="notes-manager">
      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="no-notes">No hay notas para esta tarea.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-item">
              <div className="note-header">
                <span className="note-author">{note.user_name}</span>
                <span className="note-date">{new Date(note.created_at).toLocaleString()}</span>
                <button 
                  onClick={() => handleDeleteNote(note.id)} 
                  className="btn-delete-note"
                  title="Eliminar nota"
                >
                  &times;
                </button>
              </div>
              <div className="note-content">{note.note}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleCreateNote} className="add-note-form">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nota..."
          className="note-input"
          rows={2}
        />
        <button type="submit" className="btn-add-note" disabled={!newNote.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default NotesManager;
