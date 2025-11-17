import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Notes state
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      fetchNotesFromFirebase();
    } else {
      setInitialLoading(false);
    }
  }, []);

  // Load notes from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (err) {
        console.error('Error loading notes from localStorage:', err);
      }
    }
    
    // Also fetch notes from Firebase on app load
    fetchNotesFromFirebase();
  }, [isAuthenticated]);

  // Authentication functions
  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authFormData.email || !authFormData.password || !authFormData.username) {
      setAuthError('All fields are required');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const url = `/server/user_register/execute?email=${encodeURIComponent(authFormData.email)}&password=${encodeURIComponent(authFormData.password)}&username=${encodeURIComponent(authFormData.username)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Registration failed');
      const responseData = await response.json();

      let result;
      if (responseData.output) {
        result = JSON.parse(responseData.output);
      } else {
        result = responseData;
      }

      if (result.success) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify({
          userId: result.data.userId,
          username: result.data.username,
          email: result.data.email
        }));
        setUser(result.data);
        setIsAuthenticated(true);
        setAuthFormData({ email: '', password: '', username: '' });
      } else {
        setAuthError(result.message || 'Registration failed');
      }
    } catch (err) {
      setAuthError(`Error: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authFormData.email || !authFormData.password) {
      setAuthError('Email and password are required');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const url = `/server/user_login/execute?email=${encodeURIComponent(authFormData.email)}&password=${encodeURIComponent(authFormData.password)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Login failed');
      const responseData = await response.json();

      let result;
      if (responseData.output) {
        result = JSON.parse(responseData.output);
      } else {
        result = responseData;
      }

      if (result.success) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify({
          userId: result.data.userId,
          username: result.data.username,
          email: result.data.email
        }));
        setUser(result.data);
        setIsAuthenticated(true);
        setAuthFormData({ email: '', password: '', username: '' });
      } else {
        setAuthError(result.message || 'Login failed');
      }
    } catch (err) {
      setAuthError(`Error: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('notes');
    setIsAuthenticated(false);
    setUser(null);
    setNotes([]);
    setAuthFormData({ email: '', password: '', username: '' });
    setAuthError('');
    setIsRegisterMode(false);
  };

  // Fetch notes from Firebase
  const fetchNotesFromFirebase = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/server/read_notes/execute', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notes');
      const responseData = await response.json();

      // Handle Catalyst's output wrapper
      let result;
      if (responseData.output) {
        result = JSON.parse(responseData.output);
      } else {
        result = responseData;
      }

      if (result.success && result.data) {
        setNotes(result.data);
      }
    } catch (err) {
      console.error('Error fetching notes from Firebase:', err);
    } finally {
      setInitialLoading(false);
    }
  };

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

    setSubmitLoading(true);
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
      setSubmitLoading(false);
    }
  };

  const updateNote = async (id) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSubmitLoading(true);
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
      setSubmitLoading(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    setSubmitLoading(true);
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
      setSubmitLoading(false);
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
      {!isAuthenticated ? (
        <div className="auth-container">
          <div className="auth-form-wrapper">
            <h1>Catalyst Notes App</h1>
            <p className="subtitle">Secure Notes with Authentication</p>

            {authError && <div className="error-box"><p>❌ {authError}</p></div>}

            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="auth-form">
              <h2>{isRegisterMode ? 'Create Account' : 'Sign In'}</h2>

              {isRegisterMode && (
                <div className="form-group">
                  <label htmlFor="username">Username:</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={authFormData.username}
                    onChange={handleAuthInputChange}
                    placeholder="Enter username..."
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={authFormData.email}
                  onChange={handleAuthInputChange}
                  placeholder="Enter email..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={authFormData.password}
                  onChange={handleAuthInputChange}
                  placeholder="Enter password..."
                  className="form-input"
                />
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="primary-button"
              >
                {authLoading ? (
                  <>
                    <span className="spinner"></span>
                    {isRegisterMode ? 'Creating...' : 'Signing in...'}
                  </>
                ) : (
                  isRegisterMode ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="auth-switch">
              <p>
                {isRegisterMode ? "Already have an account? " : "Don't have an account? "}
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setAuthError('');
                    setAuthFormData({ email: '', password: '', username: '' });
                  }}
                >
                  {isRegisterMode ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <header className="App-header">
          <div className="header-top">
            <div>
              <h1>Catalyst Notes App</h1>
              <p className="subtitle">Built with Catalyst Serverless</p>
            </div>
            <div className="user-info">
              <span>👤 {user?.username}</span>
              <button className="logout-button" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>

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
                  disabled={submitLoading}
                  className="submit-button"
                >
                  {submitLoading ? (
                    <>
                      <span className="spinner"></span>
                      Saving...
                    </>
                  ) : (
                    editingId ? '✏️ Update' : '💾 Save'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={handleCancel}
                  disabled={submitLoading}
                  className="cancel-button"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          )}

          <div className="notes-container">
            {initialLoading ? (
              <div className="notes-grid">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="note-card skeleton-card" style={{ animation: 'pulse 1.5s infinite' }}>
                    <div style={{ height: '24px', background: '#334155', borderRadius: '8px', marginBottom: '12px' }}></div>
                    <div style={{ height: '60px', background: '#334155', borderRadius: '8px', marginBottom: '12px' }}></div>
                    <div style={{ height: '16px', background: '#334155', borderRadius: '8px', width: '60%' }}></div>
                  </div>
                ))}
              </div>
            ) : notes.length === 0 ? (
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
                        disabled={submitLoading}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="delete-button"
                        disabled={submitLoading}
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
      )}
    </div>
  );
}

export default App;

