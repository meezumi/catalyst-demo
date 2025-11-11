import React, { useState } from 'react';
import './App.css';

function App() {
  const [formInput, setFormInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');

    try {
      // Call the demo_function serverless function
      const url = formInput 
        ? `/server/demo_function/execute?argument1=${encodeURIComponent(formInput)}`
        : '/server/demo_function/execute';
      
      const result = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const data = await result.text();
      setResponse(data);
    } catch (err) {
      setError(`Error calling function: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormInput(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Catalyst Demo App</h1>
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="input">Enter your message:</label>
              <input
                type="text"
                id="input"
                value={formInput}
                onChange={handleInputChange}
                placeholder="Type something..."
                className="form-input"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Loading...' : 'Call Function'}
            </button>
          </form>

          {error && (
            <div className="error-box">
              <p>❌ {error}</p>
            </div>
          )}

          {response && (
            <div className="response-box">
              <h3>Response:</h3>
              <p>{response}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
