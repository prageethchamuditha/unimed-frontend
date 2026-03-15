import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'https://unimed-backend.vercel.app';

function App() {
  const [indexNumber, setIndexNumber] = useState('');
  const [history, setHistory] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speechRec = new window.webkitSpeechRecognition();
      speechRec.continuous = false;
      speechRec.interimResults = false;

      speechRec.onresult = (event) => {
        setDraftText(event.results[0][0].transcript);
        setIsListening(false);
      };

      speechRec.onerror = () => {
        setIsListening(false);
      };

      setRecognition(speechRec);
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/${indexNumber}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.medicalRecords);
      } else {
        setHistory(null);
        alert("Record not found");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  const startVoice = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const saveRecord = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/${indexNumber}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis: draftText, prescription: "Pending Update" })
      });

      if (response.ok) {
        setDraftText('');
        fetchHistory();
        alert("Saved");
      } else {
        alert("Failed to save");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="container">
      <h1>UniMed Interface</h1>
      
      <div className="input-group">
        <input 
          type="text" 
          value={indexNumber} 
          onChange={(e) => setIndexNumber(e.target.value)} 
          placeholder="Enter Student Index" 
        />
        <button onClick={fetchHistory}>Retrieve History</button>
      </div>

      {history && (
        <div className="history-box">
          <h3>Medical History</h3>
          <pre>{JSON.stringify(history, null, 2)}</pre>
        </div>
      )}

      <div className="voice-group">
        <button 
          onClick={startVoice} 
          disabled={isListening} 
          className={isListening ? 'btn-listening' : 'btn-voice'}
        >
          {isListening ? 'Listening...' : 'Start Voice Input'}
        </button>
      </div>

      <div className="draft-group">
        <textarea 
          rows="5" 
          value={draftText} 
          onChange={(e) => setDraftText(e.target.value)} 
        />
      </div>

      <button onClick={saveRecord} className="btn-save">Save Visit Details</button>
    </div>
  );
}

export default App;