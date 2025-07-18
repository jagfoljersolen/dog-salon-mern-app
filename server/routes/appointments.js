const express = require('express');
const router = express.Router();

const { Appointment, validateAppointment } = require('../models/appointment');
const {
  SERVICE_DURATIONS,
  BUSINESS_HOURS,
  generateTimeSlots,
  canAccommodateDuration,
  getWeeklySchedule
} = require('../utils/slotUtils');

function parseServices(servicesQuery) {
  const services = servicesQuery || req.query['services[]'];
  
  console.log('parseServices input:', services, typeof services);
  
  if (!services) return [];
  
  if (typeof services === 'string') {
    return [services];
  }
  
  if (Array.isArray(services)) {
    return services.filter(Boolean);
  }
  
  return [];
}

const auth = require('../middleware/auth');
// POST /api/appointments 
router.post('/', auth, async (req, res) => {
  try {
    const { error } = validateAppointment(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const appointmentDateTime = new Date(`${req.body.date}T${req.body.timeSlot}:00`);
    const currentDateTime = new Date();
    
    if (appointmentDateTime <= currentDateTime) {
      return res.status(400).json({ 
        message: "Nie można rezerwować wizyt na przeszłe daty lub godziny." 
      });
    }

    const duration = req.body.services.reduce(
      (sum, service) => sum + (SERVICE_DURATIONS[service] || 0), 0
    );
    if (duration === 0) {
      return res.status(400).json({ message: "Nieprawidłowe lub brakujące usługi." });
    }

    const existingAppointments = await Appointment.find({ date: req.body.date }).hint({ date: 1 });

    const isAvailable = canAccommodateDuration(
      req.body.date,
      req.body.timeSlot,
      duration,
      existingAppointments
    );

    if (!isAvailable) {
      return res.status(409).json({ message: 'Wybrany termin nie jest już dostępny.' });
    }

    const appointment = new Appointment({
      userId: req.user._id,  
      ...req.body,
      duration
    });
    await appointment.save();

    res.status(201).json({ 
      success: true,
      message: "Wizyta została pomyślnie zarezerwowana.",
      appointment: {
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        services: appointment.services
      }
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ 
      success: false,
      message: "Błąd podczas rezerwacji wizyty." 
    });
  }
});


// GET /api/available-slots/:date
router.get('/available-slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
        
    const servicesParam = req.query.services || req.query['services[]'];
    const services = parseServices(servicesParam);
    
    if (!date) return res.status(400).json({ message: "Brak daty." });
    if (!services.length) return res.status(400).json({ message: "Nie wybrano usług." });
    
    const duration = services.reduce(
      (sum, service) => sum + (SERVICE_DURATIONS[service] || 0), 0
    );
    
    if (duration === 0) {
      return res.status(400).json({ message: "Nieprawidłowe usługi." });
    }
    
    const existingAppointments = await Appointment.find({ date }).hint({ date: 1 });
    
    const slots = generateTimeSlots(date, 15);
    const availableSlots = slots.filter(slot =>
      canAccommodateDuration(date, slot, duration, existingAppointments)
    );
    
    res.json({ slots: availableSlots });
    
  } catch (error) {
    console.error('Route error:', error);
    return res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /api/weekly-schedule/:startDate
router.get('/weekly-schedule/:startDate', async (req, res) => {
  const { startDate } = req.params;
  const services = parseServices(req.query.services);

  if (!startDate) return res.status(400).json({ message: "Brak daty początkowej." });
  if (!services.length) return res.status(400).json({ message: "Nie wybrano usług." });

  const duration = services.reduce(
    (sum, service) => sum + (SERVICE_DURATIONS[service] || 0), 0
  );
  if (duration === 0) {
    return res.status(400).json({ message: "Nieprawidłowe usługi." });
  }

  const weeklySchedule = await getWeeklySchedule(startDate, duration);
  res.json(weeklySchedule);
});



router.get('/history', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .sort({ date: 1, timeSlot: 1 })
    
    res.json({ 
      success: true,
      appointments,
      total: appointments.length 
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: "Błąd pobierania historii wizyt" 
    });
  }
});

module.exports = router;

// PUT /api/appointments/:id - Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validateAppointment(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const appointmentDateTime = new Date(`${req.body.date}T${req.body.timeSlot}:00`);
    const currentDateTime = new Date();
    
    if (appointmentDateTime <= currentDateTime) {
      return res.status(400).json({ 
        message: "Nie można aktualizować wizyt na przeszłe daty lub godziny." 
      });
    }

    const duration = req.body.services.reduce(
      (sum, service) => sum + (SERVICE_DURATIONS[service] || 0), 0
    );

    const existingAppointment = await Appointment.findById(id);
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Wizyta nie została znaleziona.' });
    }
    
    if (existingAppointment.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Brak uprawnień do edycji tej wizyty.' });
    }

    // Check slot availability for the new time (excluding current appointment)
    const conflictingAppointments = await Appointment.find({ 
      date: req.body.date,
      _id: { $ne: id }
    }).hint({ date: 1 });

    const isAvailable = canAccommodateDuration(
      req.body.date,
      req.body.timeSlot,
      duration,
      conflictingAppointments
    );

    if (!isAvailable) {
      return res.status(409).json({ message: 'Wybrany termin nie jest już dostępny.' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        ...req.body,
        duration,
        userId: req.user._id
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Wizyta została pomyślnie zaktualizowana.',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Błąd podczas aktualizacji wizyty.' 
    });
  }
});

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Wizyta nie została znaleziona.' });
    }

    if (appointment.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Brak uprawnień do anulowania tej wizyty.' });
    }

    const appointmentDateTime = new Date(`${appointment.date}T${appointment.timeSlot}:00`);
    const currentDateTime = new Date();
    const hoursUntilAppointment = (appointmentDateTime - currentDateTime) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({ 
        message: 'Nie można anulować wizyty na mniej niż 24 godziny przed terminem.' 
      });
    }

    await Appointment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Wizyta została pomyślnie anulowana.'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Błąd podczas anulowania wizyty.' 
    });
  }
});

