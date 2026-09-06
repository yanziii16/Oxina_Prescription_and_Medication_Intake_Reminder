import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddMedication() {
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    time: '08:00',
    refillCount: ''
  });
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/medications', {
        name: form.name,
        dosage: form.dosage,
        timeOfDay: form.time,
        refillCount: Number(form.refillCount)
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving medication:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save prescription.';
      alert(`Save Failed: ${errorMessage}`);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  return (
    <div className="page">
      <div className="form-page">
        <div className="form-container">
          <div className="form-header">
            <div className="form-header-icon">💊</div>
            <h2>Add New Medication</h2>
            <p>Set your medication schedule and reminder.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Medication Name</label>
              <input
                type="text"
                placeholder="e.g. Biogesic"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Dosage</label>
              <input
                type="text"
                placeholder="e.g. 500mg"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Medication Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Refill Count</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={form.refillCount}
                onChange={(e) => setForm({ ...form, refillCount: e.target.value })}
                required
              />
            </div>

            <div className="reminder-info">
              🔔 You will receive a browser notification when it is time to take this medication.
            </div>

            <button type="submit" className="save-button">
              💾 Save Prescription
            </button>
          </form>
        </div>
      </div>

      {/* 4. CUSTOM SUCCESS MODAL UI */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            maxWidth: '380px',
            width: '90%'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '22px' }}>
              Success!
            </h3>
            <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '24px' }}>
              Prescription saved successfully!
            </p>
            <button
              onClick={handleModalClose}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                width: '100%',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0369a1'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0284c7'}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}