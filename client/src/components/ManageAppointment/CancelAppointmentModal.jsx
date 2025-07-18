import React, { useState } from 'react';
import axios from 'axios';

const CancelAppointmentModal = ({ appointment, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lavender = {
    light: "#f3e8ff",
    main: "#b983ff",
    dark: "#7f53ac",
    accent: "#a084ca"
  };

  const handleCancel = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.delete(`/api/appointments/${appointment._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Błąd podczas anulowania wizyty');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '400px',
          width: '90%',
          border: `2px solid ${lavender.main}`,
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: lavender.dark
          }}
        >
          ×
        </button>

        <h4 style={{ color: '#dc3545', marginBottom: '20px' }}>
          Anuluj wizytę
        </h4>
        
        <p>Czy na pewno chcesz anulować wizytę dla <strong>{appointment?.name}</strong>?</p>
        <p><strong>Data:</strong> {formatDate(appointment?.date)}</p>
        <p><strong>Godzina:</strong> {appointment?.timeSlot}</p>

        {error && (
          <div className="alert alert-danger mb-3">{error}</div>
        )}

        <div className="d-flex gap-2 mt-4">
          <button
            className="btn btn-danger flex-fill"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Anulowanie...' : 'Tak, anuluj'}
          </button>
          <button
            className="btn btn-secondary flex-fill"
            onClick={onClose}
          >
            Nie, zostaw
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointmentModal;
