import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'https://unimed-backend.vercel.app';

function App() {
  const [indexNumber, setIndexNumber] = useState('');
  const [history, setHistory] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const [newIndex, setNewIndex] = useState('');
  const [newName, setNewName] = useState('');

  const [docId, setDocId] = useState('');
  const [docName, setDocName] = useState('');
  const [docPass, setDocPass] = useState('');

  const [labId, setLabId] = useState('');
  const [labName, setLabName] = useState('');
  const [labPass, setLabPass] = useState('');

  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [role, setRole] = useState('doctor');
  const [user, setUser] = useState(null);

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
        alert("Student not registered. Please register them first.");
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

  const registerStudent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexNumber: newIndex, name: newName })
      });

      if (response.ok) {
        setNewIndex('');
        setNewName('');
        alert("Student Registered Successfully!");
      } else {
        alert("Failed to register student");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  const registerDoctor = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: docId, name: docName, password: docPass })
      });
      if (response.ok) {
        setDocId('');
        setDocName('');
        setDocPass('');
        alert("Doctor Registered!");
      } else {
        alert("Failed");
      }
    } catch (error) {
      alert("Error");
    }
  };

  const registerLab = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/labassistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId: labId, name: labName, password: labPass })
      });
      if (response.ok) {
        setLabId('');
        setLabName('');
        setLabPass('');
        alert("Lab Assistant Registered!");
      } else {
        alert("Failed");
      }
    } catch (error) {
      alert("Error");
    }
  };

  const handleLogin = async () => {
    try {
      const endpoint = role === 'doctor' ? 'doctors' : 'labassistant';
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${loginId}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPass })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        alert("Logged in successfully!");
      } else {
        alert("User not found or incorrect password");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="container">
      <h1>UniMed Interface</h1>

      {!user ? (
        <div>
          <div className="history-box">
            <h3>Staff Login</h3>
            <div className="input-group">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="doctor">Doctor</option>
                <option value="labassistant">Lab Assistant</option>
              </select>
              <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="ID" />
              <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" />
              <button onClick={handleLogin} className="btn-save">Login</button>
            </div>
          </div>

          <div className="history-box">
            <h3>Register Staff</h3>
            <h4>Doctor</h4>
            <div className="input-group">
              <input type="text" value={docId} onChange={(e) => setDocId(e.target.value)} placeholder="Doctor ID" />
              <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Name" />
              <input type="password" value={docPass} onChange={(e) => setDocPass(e.target.value)} placeholder="Password" />
              <button onClick={registerDoctor} className="btn-save">Register</button>
            </div>
            <h4>Lab Assistant</h4>
            <div className="input-group">
              <input type="text" value={labId} onChange={(e) => setLabId(e.target.value)} placeholder="Assistant ID" />
              <input type="text" value={labName} onChange={(e) => setLabName(e.target.value)} placeholder="Name" />
              <input type="password" value={labPass} onChange={(e) => setLabPass(e.target.value)} placeholder="Password" />
              <button onClick={registerLab} className="btn-save">Register</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="history-box">
            <h3>Welcome, {user.name}</h3>
            <button onClick={() => setUser(null)} style={{ backgroundColor: '#dc3545' }}>Logout</button>
          </div>

          <div className="history-box">
            <h3>Clerk: Register New Student</h3>
            <div className="input-group">
              <input
                type="text"
                value={newIndex}
                onChange={(e) => setNewIndex(e.target.value)}
                placeholder="Index Number"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Student Name"
              />
              <button onClick={registerStudent} className="btn-save">Register</button>
            </div>
          </div>

          <hr style={{ margin: '30px 0' }} />

          <div className="input-group">
            <input 
              type="text" 
              value={indexNumber} 
              onChange={(e) => setIndexNumber(e.target.value)} 
              placeholder="Enter Student Index" 
            />
            <button onClick={fetchHistory}>Retrieve History</button>
          </div>

          {history && history.length > 0 ? (
            <div className="history-box">
              <h3>Medical History</h3>
              {history.map((record, index) => (
                <div key={index} className="record-card">
                  <p><strong>Date:</strong> {new Date(record.timestamp).toLocaleString()}</p>
                  <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                  <p><strong>Prescription:</strong> {record.prescription}</p>
                </div>
              ))}
            </div>
          ) : history && history.length === 0 ? (
            <div className="history-box">
              <h3>Medical History</h3>
              <p>No previous data there. This is a new member.</p>
            </div>
          ) : null}

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
      )}
    </div>
  );
}

export default App;
