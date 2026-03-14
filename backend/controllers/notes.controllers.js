const { pool } = require('../config/database');



// Crear una nueva nota

const createNote = async (req, res) => {

  try {

    const { task_id, note } = req.body;

    const user_id = req.user.id;



    if (!task_id || !note) {

      return res.status(400).json({

        success: false,

        message: 'El ID de la tarea y el contenido de la nota son obligatorios'

      });

    }



    const [result] = await pool.execute(

      'INSERT INTO task_notes (task_id, user_id, content) VALUES (?, ?, ?)',

      [task_id, user_id, note]

    );



    // Obtener la nota creada con información del usuario

    const [newNote] = await pool.execute(`

      SELECT n.*, u.name as user_name 

      FROM task_notes n

      JOIN users u ON n.user_id = u.id

      WHERE n.id = ?

    `, [result.insertId]);



    res.status(201).json({

      success: true,

      message: 'Nota creada exitosamente',

      data: {

        ...newNote[0],

        note: newNote[0].content // Mapear content a note para el frontend

      }

    });

  } catch (error) {

    console.error('Error al crear nota:', error);

    res.status(500).json({

      success: false,

      message: 'Error al crear la nota'

    });

  }

};



// Obtener notas de una tarea

const getNotesByTask = async (req, res) => {

  try {

    const { taskId } = req.params;



    const [notes] = await pool.execute(`

      SELECT n.*, u.name as user_name 

      FROM task_notes n

      JOIN users u ON n.user_id = u.id

      WHERE n.task_id = ?

      ORDER BY n.created_at DESC

    `, [taskId]);



    // Obtener archivos adjuntos para cada nota (si los hubiera)

    // Por ahora, asumimos que los archivos se gestionan por separado o se implementará después

    // Si la tabla files tiene note_id, podríamos hacer un join o una query adicional.

    // Revisando migración 19: files tiene note_id.

    

    for (let note of notes) {

      const [files] = await pool.execute(

        'SELECT * FROM files WHERE note_id = ?',

        [note.id]

      );

      note.files = files;

    }



    // Mapear content a note para el frontend

    const mappedNotes = notes.map(note => ({

      ...note,

      note: note.content // Mapear content a note

    }));



    res.json({

      success: true,

      data: mappedNotes

    });

  } catch (error) {

    console.error('Error al obtener notas:', error);

    res.status(500).json({

      success: false,

      message: 'Error al obtener las notas de la tarea'

    });

  }

};



// Eliminar nota

const deleteNote = async (req, res) => {

  try {

    const { id } = req.params;

    const userId = req.user.id;

    const userRole = req.user.role;



    // Verificar si la nota existe y obtener el autor

    const [notes] = await pool.execute('SELECT * FROM task_notes WHERE id = ?', [id]);



    if (notes.length === 0) {

      return res.status(404).json({

        success: false,

        message: 'Nota no encontrada'

      });

    }



    const note = notes[0];



    // Solo el autor o un admin pueden eliminar la nota

    if (note.user_id !== userId && userRole !== 'admin') {

      return res.status(403).json({

        success: false,

        message: 'No tienes permiso para eliminar esta nota'

      });

    }



    await pool.execute('DELETE FROM task_notes WHERE id = ?', [id]);



    res.json({

      success: true,

      message: 'Nota eliminada exitosamente'

    });

  } catch (error) {

    console.error('Error al eliminar nota:', error);

    res.status(500).json({

      success: false,

      message: 'Error al eliminar la nota'

    });

  }

};



module.exports = {

  createNote,

  getNotesByTask,

  deleteNote

};

