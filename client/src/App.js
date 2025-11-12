import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (err) {
        console.error('Error loading notes from localStorage:', err);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `/server/create_note/execute?title=${encodeURIComponent(formData.title)}&content=${encodeURIComponent(formData.content)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to create note');
      const responseData = await response.json();

      // Handle Catalyst's output wrapper
      let result;
      if (responseData.output) {
        result = JSON.parse(responseData.output);
      } else {
        result = responseData;
      }

      if (result.success && result.data) {
        setNotes(prev => [...prev, result.data]);
        setFormData({ title: '', content: '' });
        setShowForm(false);
      } else {
        setError(result.message || 'Failed to create note');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `/server/update_note/execute?id=${encodeURIComponent(id)}&title=${encodeURIComponent(formData.title)}&content=${encodeURIComponent(formData.content)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to update note');
      const responseData = await response.json();

      // Handle Catalyst's output wrapper
      let result;
      if (responseData.output) {
        result = JSON.parse(responseData.output);
      } else {
        result = responseData;
      }

      if (result.success) {
        setNotes(prev => prev.map(note => 
          note.id === id 
            ? { ...note, title: formData.title, content: formData.content, updatedAt: new Date().toISOString() }
            : note
        ));
        setFormData({ title: '', content: '' });
        setEditingId(null);
        setShowForm(false);
      } else {
        setError(result.message || 'Failed to update note');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    setError('');

    try {
      const url = `/server/delete_note/execute?id=${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete note');
      const responseData = await response.json();

      // Handle Catalyst's output wrapper
      let result;
      if (responseData.output) {
        result = JSON.parse(responseData.output);
      } else {
        result = responseData;
      }

      if (result.success) {
        setNotes(prev => prev.filter(note => note.id !== id));
      } else {
        setError(result.message || 'Failed to delete note');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setFormData({ title: note.title, content: note.content });
    setEditingId(note.id);
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setFormData({ title: '', content: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateNote(editingId);
    } else {
      createNote();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 Notes App</h1>
        <p className="subtitle">Built with Catalyst Serverless</p>

        {error && <div className="error-box"><p>❌ {error}</p></div>}

        {!showForm && (
          <button 
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + New Note
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="note-form">
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter note title..."
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Content:</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter note content..."
                className="form-input textarea"
                rows="5"
              />
            </div>
            <div className="form-buttons">
              <button 
                type="submit" 
                disabled={loading}
                className="submit-button"
              >
                {loading ? '⏳ Saving...' : (editingId ? '✏️ Update' : '💾 Save')}
              </button>
              <button 
                type="button"
                onClick={handleCancel}
                className="cancel-button"
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        )}

        <div className="notes-container">
          {notes.length === 0 ? (
            <p className="no-notes">No notes yet. Create one to get started! 🚀</p>
          ) : (
            <div className="notes-grid">
              {notes.map(note => (
                <div key={note.id} className="note-card">
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                  <small className="note-date">
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </small>
                  <div className="note-actions">
                    <button 
                      onClick={() => handleEdit(note)}
                      className="edit-button"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="delete-button"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;

