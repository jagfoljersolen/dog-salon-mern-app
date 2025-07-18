import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import { useEffect } from "react";
import { Link } from "react-router-dom";

const SERVICES = [
    { label: "Kąpiel i suszenie", value: "Kąpiel i suszenie" },
    { label: "Strzyżenie", value: "Strzyżenie" },
    { label: "Trymowanie", value: "Trymowanie" },
    { label: "Obcinanie pazurów", value: "Obcinanie pazurów" },
    { label: "Czyszczenie uszu", value: "Czyszczenie uszu" }
];

const lavender = {
    light: "#f3e8ff",
    main: "#b983ff",
    dark: "#7f53ac",
    accent: "#a084ca"
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};


const Main = () => {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);
    const [note, setNote] = useState("");
    const [error, setError] = useState("");

    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    const handleCheckboxChange = (service) => {
        setSelectedServices((prev) =>
            prev.includes(service)
                ? prev.filter((s) => s !== service)
                : [...prev, service]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        if (selectedServices.length === 0) {
            setError("Wybierz przynajmniej jedną usługę.");
            setIsSubmitting(false);
            return;
        }
        if (!selectedSlot) {
            setError("Wybierz godzinę wizyty.");
            setIsSubmitting(false);
            return;
        }
        
        try {
            const response = await axios.post('/api/appointments', {
                name,
                date,
                timeSlot: selectedSlot,
                phone,
                note,
                services: selectedServices
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setSuccessMessage("Wizyta została pomyślnie zarezerwowana!");
            
            setTimeout(() => {
                setSuccessMessage("");
            }, 5000);
            
            setTimeout(() => {
                setName("");
                setDate("");
                setPhone("");
                setSelectedServices([]);
                setNote("");
                setSelectedSlot("");
                setAvailableSlots([]);
            }, 1000);
            
        } catch (error) {
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Wystąpił błąd. Spróbuj ponownie.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };



    useEffect(() => {
        if (date && selectedServices.length) {
            setLoadingSlots(true);
            axios.get(`/api/appointments/available-slots/${date}`, { 
                params: { services: selectedServices },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => setAvailableSlots(res.data.slots))
                .catch(() => setAvailableSlots([]))
                .finally(() => setLoadingSlots(false));
        } else {
            setAvailableSlots([]);
        }
    }, [date, selectedServices]);

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
                        to="/appointment-history"
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
                        Historia wizyt
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
            <div className="container flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="col-md-7">
                    <div
                        className="card shadow rounded p-4 mt-5"
                        style={{
                            background: "#fff",
                            border: `2px solid ${lavender.main}`,
                            boxShadow: `0 4px 24px 0 ${lavender.main}33`
                        }}
                    >
                        <div className="text-center mb-4">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
                                alt="Dog Icon"
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
                                Umów wizytę
                            </h2>
                        </div>
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}
                        {successMessage && (
                            <div className="alert alert-success" style={{ 
                                backgroundColor: lavender.light, 
                                borderColor: lavender.main, 
                                color: lavender.dark 
                            }}>
                                <strong> {successMessage}</strong>
                                
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: lavender.dark }}>
                                    Imię psa:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    placeholder="Podaj imię pieska"
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{ borderColor: lavender.main }}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: lavender.dark }}>
                                    Data:
                                </label>
                                <div className="input-group">
                                    <span
                                        className="input-group-text"
                                        style={{ background: lavender.light, color: lavender.dark }}
                                    >
                                        <i className="bi bi-calendar-event"></i>
                                    </span>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={date}
                                        min={getCurrentDate()}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        style={{ borderColor: lavender.main }}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: lavender.dark }}>
                                    Numer telefonu:
                                </label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={phone}
                                    placeholder="Podaj numer telefonu"
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    style={{ borderColor: lavender.main }}
                                />
                            </div>
                            <fieldset className="mb-3">
                                <legend
                                    className="col-form-label pt-0"
                                    style={{ color: lavender.dark }}
                                >
                                    Wybierz usługi:
                                </legend>
                                <div className="row">
                                    {SERVICES.map((service) => (
                                        <div className="col-6" key={service.value}>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={service.value}
                                                    checked={selectedServices.includes(service.value)}
                                                    onChange={() => handleCheckboxChange(service.value)}
                                                    style={{
                                                        accentColor: lavender.main
                                                    }}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={service.value}
                                                    style={{ color: lavender.dark }}
                                                >
                                                    {service.label}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: lavender.dark }}>
                                    Dodatkowe uwagi:
                                </label>
                                <textarea
                                    className="form-control"
                                    value={note}
                                    placeholder="Wpisz dodatkowe informacje lub uwagi"
                                    onChange={(e) => setNote(e.target.value)}
                                    style={{ borderColor: lavender.main }}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: lavender.dark }}>
                                    Wybierz godzinę wizyty:
                                </label>
                                {loadingSlots ? (
                                    <div>Ładowanie dostępnych godzin...</div>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {availableSlots.length === 0 && (date && selectedServices.length) ? (
                                            <span>Brak dostępnych godzin dla wybranej daty i usług.</span>
                                        ) : (
                                            availableSlots.map(slot => (
                                                <button
                                                    type="button"
                                                    key={slot}
                                                    className={`btn ${selectedSlot === slot ? "btn-primary" : "btn-outline-primary"}`}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    {slot}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="btn w-100 shadow-sm"
                                style={{
                                    background: lavender.main,
                                    color: "#fff",
                                    fontWeight: "bold",
                                    border: "none"
                                }}
                            >
                                Umów wizytę
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
