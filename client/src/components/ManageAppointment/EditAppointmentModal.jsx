import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditAppointmentModal = ({ appointment, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    timeSlot: '',
    phone: '',
    note: '',
    services: []
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lavender = {
    light: "#f3e8ff",
    main: "#b983ff",
    dark: "#7f53ac",
    accent: "#a084ca"
  };

  const SERVICES = [
    "Kąpiel i suszenie",
    "Strzyżenie",
    "Trymowanie",
    "Obcinanie pazurów",
    "Czyszczenie uszu"
  ];

  useEffect(() => {
    if (appointment && isOpen) {
      setFormData({
        name: appointment.name,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        phone: appointment.phone,
        note: appointment.note || '',
        services: appointment.services
      });
    }
  }, [appointment, isOpen]);

  useEffect(() => {
    if (formData.date && formData.services.length > 0) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.services]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(`/api/appointments/available-slots/${formData.date}`, {
        params: { services: formData.services },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.put(`/api/appointments/${appointment._id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Błąd podczas aktualizacji wizyty');
    } finally {
      setLoading(false);
    }
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
        className="modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
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

        <h3 style={{ color: lavender.dark, marginBottom: '20px' }}>
          Edytuj wizytę
        </h3>

        {error && (
          <div className="alert alert-danger mb-3">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: lavender.dark }}>
              Imię zwierzaka
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: lavender.dark }}>
              Data
            </label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: lavender.dark }}>
              Usługi
            </label>
            <div>
              {SERVICES.map(service => (
                <div key={service} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.services.includes(service)}
                    onChange={() => handleServiceChange(service)}
                  />
                  <label className="form-check-label">{service}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: lavender.dark }}>
              Dostępne godziny
            </label>
            <div>
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  className={`btn m-1 ${formData.timeSlot === slot ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{
                    backgroundColor: formData.timeSlot === slot ? lavender.main : 'transparent',
                    borderColor: lavender.main,
                    color: formData.timeSlot === slot ? '#fff' : lavender.main
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: lavender.dark }}>
              Telefon
            </label>
            <input
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: lavender.dark }}>
              Notatka (opcjonalna)
            </label>
            <textarea
              className="form-control"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows="3"
            />
          </div>

          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn flex-fill"
              disabled={loading}
              style={{
                backgroundColor: lavender.main,
                color: '#fff',
                border: 'none'
              }}
            >
              {loading ? 'Aktualizacja...' : 'Zaktualizuj wizytę'}
            </button>
            <button
              type="button"
              className="btn btn-secondary flex-fill"
              onClick={onClose}
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
