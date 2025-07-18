import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import EditAppointmentModal from './EditAppointmentModal';
import CancelAppointmentModal from './CancelAppointmentModal';


const lavender = {
    light: "#f3e8ff",
    main: "#b983ff",
    dark: "#7f53ac",
    accent: "#a084ca"
};

const AppointmentHistory = () => {
  const [past, setPast] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [cancelingAppointment, setCancelingAppointment] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.get("/api/appointments/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const now = new Date();
      const pastAppointments = [];
      const upcomingAppointments = [];
      
      response.data.appointments.forEach(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.timeSlot}:00`);
        if (appointmentDate < now) {
          pastAppointments.push(appointment);
        } else {
          upcomingAppointments.push(appointment);
        }
      });
      
      setPast(pastAppointments);
      setUpcoming(upcomingAppointments);
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Sesja wygasła. Zaloguj się ponownie.");
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError("Błąd podczas ładowania historii wizyt");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
  };

  const handleCancel = (appointment) => {
    setCancelingAppointment(appointment);
  };

  const handleEditSuccess = () => {
    setSuccessMessage("Wizyta została pomyślnie zaktualizowana!");
    setTimeout(() => setSuccessMessage(""), 5000);
    fetchAppointments(); 
    setEditingAppointment(null);
  };

  const handleCancelSuccess = () => {
    setSuccessMessage("Wizyta została pomyślnie anulowana!");
    setTimeout(() => setSuccessMessage(""), 5000);
    fetchAppointments(); 
    setCancelingAppointment(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeSlot}:00`);
    const now = new Date();
    
    if (appointmentDate > now) {
      return (
        <span 
          className="badge rounded-pill"
          style={{ 
            backgroundColor: lavender.light, 
            color: lavender.dark,
            border: `1px solid ${lavender.main}`
          }}
        >
          Zaplanowana
        </span>
      );
    } else {
      return (
        <span 
          className="badge rounded-pill"
          style={{ 
            backgroundColor: lavender.accent, 
            color: "#fff"
          }}
        >
          Zakończona
        </span>
      );
    }
  };

  const getCurrentAppointments = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcoming;
      case 'past':
        return past;
      default:
        return [...upcoming, ...past];
    }
  };

  return (
   <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${lavender.light} 0%, ${lavender.main} 100%)`
      }}
      className="d-flex flex-column"
    >
      <nav className="navbar navbar-expand-lg shadow-sm"
        style={{ background: lavender.dark }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 className="navbar-brand mb-0" style={{ color: "#fff" }}>
            <span role="img" aria-label="dog">🐾</span> Stylowy Piesek
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              to="/"
              style={{
                background: "#fff",
                color: lavender.dark,
                borderRadius: "20px",
                padding: "10px 20px",
                fontWeight: "bold",
                textDecoration: "none",
                fontSize: "14px",
                marginRight: "10px"
              }}
            >
              Umów wizytę
            </Link>
            <button
              className="btn"
              style={{
                background: lavender.accent,
                color: "#fff",
                border: "none"
              }}
              onClick={handleLogout}
            >
              Wyloguj
            </button>
          </div>
        </div>
      </nav>

      <div className="container flex-grow-1 d-flex align-items-start justify-content-center pt-5">
        <div className="col-lg-10">
          <div
            className="card shadow rounded p-4"
            style={{
              background: "#fff",
              border: `2px solid ${lavender.main}`,
              boxShadow: `0 4px 24px 0 ${lavender.main}33`
            }}
          >
            <div className="text-center mb-4">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
                alt="History Icon"
                width={64}
                className="mb-2"
                style={{
                  filter: `drop-shadow(0 0 8px ${lavender.main}66)`
                }}
              />
              <h2
                className="card-title mb-0"
                style={{ color: lavender.dark }}
              >
                Historia Wizyt
              </h2>
            </div>

            

            {/* Tab Navigation */}
            <div className="mb-4">
              <div className="btn-group w-100" role="group">
                <button 
                  type="button"
                  className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{
                    backgroundColor: activeTab === 'upcoming' ? lavender.main : 'transparent',
                    borderColor: lavender.main,
                    color: activeTab === 'upcoming' ? '#fff' : lavender.main
                  }}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Nadchodzące ({upcoming.length})
                </button>
                <button 
                  type="button"
                  className={`btn ${activeTab === 'past' ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{
                    backgroundColor: activeTab === 'past' ? lavender.main : 'transparent',
                    borderColor: lavender.main,
                    color: activeTab === 'past' ? '#fff' : lavender.main
                  }}
                  onClick={() => setActiveTab('past')}
                >
                  Przeszłe ({past.length})
                </button>
                <button 
                  type="button"
                  className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{
                    backgroundColor: activeTab === 'all' ? lavender.main : 'transparent',
                    borderColor: lavender.main,
                    color: activeTab === 'all' ? '#fff' : lavender.main
                  }}
                  onClick={() => setActiveTab('all')}
                >
                  Wszystkie ({upcoming.length + past.length})
                </button>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div 
                className="alert alert-success mb-4"
                style={{
                  backgroundColor: lavender.light,
                  borderColor: lavender.main,
                  color: lavender.dark
                }}
              >
                <strong> {successMessage}</strong>
              </div>
            )}

            {error && (
              <div className="alert alert-danger mb-4">{error}</div>
            )}
            
            {loading ? (
              <div className="text-center py-5">
                <div 
                  className="spinner-border"
                  style={{ color: lavender.main }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3" style={{ color: lavender.dark }}>Ładowanie historii wizyt...</p>
              </div>
            ) : (
             <AppointmentList 
                appointments={getCurrentAppointments()} 
                onEdit={handleEdit}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      </div>
      {/* Modals */}
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          isOpen={!!editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      
      {cancelingAppointment && (
        <CancelAppointmentModal
          appointment={cancelingAppointment}
          isOpen={!!cancelingAppointment}
          onClose={() => setCancelingAppointment(null)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
};

const AppointmentList = ({ appointments, onEdit, onCancel }) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: "4rem" }}>📅</div>
        <h3 style={{ color: lavender.dark }}>Brak wizyt</h3>
        <p style={{ color: lavender.dark }}>Nie masz jeszcze żadnych wizyt w tej kategorii.</p>
      </div>
    );
  }

  return (
    <div className="row">
      {appointments.map((appointment) => (
        <div key={appointment._id} className="mb-4">
          <AppointmentCard 
            appointment={appointment} 
            onEdit={onEdit}
            onCancel={onCancel}
          />
        </div>
      ))}
    </div>
  );
};


const AppointmentCard = ({ appointment, onEdit, onCancel }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeSlot}:00`);
    const now = new Date();
    
    if (appointmentDate > now) {
      return (
        <span 
          className="badge rounded-pill"
          style={{ 
            backgroundColor: lavender.light, 
            color: lavender.dark,
            border: `1px solid ${lavender.main}`
          }}
        >
          Zaplanowana
        </span>
      );
    } else {
      return (
        <span 
          className="badge rounded-pill"
          style={{ 
            backgroundColor: lavender.accent, 
            color: "#fff"
          }}
        >
          Zakończona
        </span>
      );
    }
  };

  const canModify = () => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeSlot}:00`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
    return appointmentDate > now && hoursUntilAppointment >= 24; 
  };

  return (
    <div 
      className="card h-100"
      style={{ 
        border: `1px solid ${lavender.main}`,
        boxShadow: `0 2px 8px ${lavender.main}33`,
         width: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div 
        className="card-header d-flex justify-content-between align-items-center"
        style={{ 
          background: lavender.light,
          borderBottom: `1px solid ${lavender.main}`
        }}
      >
        <div>
          <h5 className="mb-1" style={{ color: lavender.dark }}>{appointment.name}</h5>
        </div>
        {getStatusBadge(appointment)}
      </div>
      
      <div className="card-body d-flex flex-row ">
        <div style={{ flex: 1 }}>
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <span className="me-2">📅</span>
              <strong style={{ color: lavender.dark }}>{formatDate(appointment.date)}</strong>
              <span className="ms-4 me-2">🕐</span>
              <span style={{ color: lavender.dark }}>{appointment.timeSlot}</span>
            </div>
          </div>
          <h6 style={{ color: lavender.dark }}>Usługi:</h6>
          <ul className="list-unstyled">
            {appointment.services.map((service, index) => (
              <li key={index} className="d-flex align-items-center">
                <span style={{ color: lavender.main, marginRight: "8px" }}>•</span>
                <span style={{ color: lavender.dark }}>{service}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="d-flex align-items-center mb-2">
          <span className="me-2">⏱️</span>
          <span style={{ color: lavender.dark, fontWeight: "500" }}>{appointment.duration} minut</span>
        </div>
        
        {appointment.note && (
          <div >
            <h6 style={{ color: lavender.dark }}>Notatka:</h6>
            <p 
              className="small p-2 rounded"
              style={{ 
                backgroundColor: lavender.light,
                color: lavender.dark,
                border: `1px solid ${lavender.main}`
              }}
            >
              {appointment.note}
            </p>
          </div>
        )}
      </div>
      
      {/* Action Buttons - Only show for upcoming appointments */}
      
      {canModify() && (
        <div 
          className="card-footer d-flex gap-2 justify-content-end"
          style={{ 
            borderTop: `1px solid ${lavender.main}`
          }}
        >
          <div className="d-flex justify-content-end">
          <button
            className="btn btn-sm "
            style={{
              backgroundColor: lavender.main,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              marginRight: '8px'
            }}
            onClick={() => onEdit(appointment)}
          >
            <span className="me-2">✏️</span>
            Edytuj
          </button>
          <button
            className="btn btn-sm btn-outline-danger "
            style={{
              borderRadius: '8px'
            }}
            onClick={() => onCancel(appointment)}
          >
            Anuluj wizytę
          </button>
        </div>
        </div>
      )}
      
      {/* Creation Date Footer */}
      <div 
        className="card-footer text-left"
        style={{ 
          borderTop: canModify() ? 'none' : `1px solid ${lavender.main}`,
          fontSize: '0.8rem'
        }}
      >
        <small style={{ color: lavender.dark }}>
          Utworzono: {new Date(appointment.createdAt).toLocaleDateString('pl-PL')}
        </small>
      </div>
    </div>
  );
};

export default AppointmentHistory;
