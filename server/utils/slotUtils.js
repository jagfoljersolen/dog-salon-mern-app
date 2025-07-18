const { Appointment } = require('../models/appointment');

const SERVICE_DURATIONS = {
  "Kąpiel i suszenie": 60,
  "Strzyżenie": 60,
  "Trymowanie": 45,
  "Obcinanie pazurów": 15,
  "Czyszczenie uszu": 15
};

const BUSINESS_HOURS = {
  'poniedziałek': { start: '09:00', end: '17:00' },
  'wtorek':       { start: '14:00', end: '20:00' },
  'środa':        { start: '09:00', end: '17:00' },
  'czwartek':     { start: '10:00', end: '14:00' },
  'piątek':       { start: '09:00', end: '17:00' },
  'sobota':       { start: '10:00', end: '14:00' },
  'niedziela':    { start: 'closed', end: 'closed' }
};

function generateTimeSlots(date, slotIntervalMinutes = 15, filterPastTimes = true) {
  const dayName = new Date(date).toLocaleDateString('pl-PL', { weekday: 'long' }).toLowerCase();
  const hours = BUSINESS_HOURS[dayName];
  if (!hours || hours.start === 'closed' || hours.end === 'closed') return [];

  const slots = [];
  let current = new Date(`${date}T${hours.start}:00`);
  const end = new Date(`${date}T${hours.end}:00`);
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  while (current < end) {
    const hour = current.getHours().toString().padStart(2, '0');
    const minute = current.getMinutes().toString().padStart(2, '0');
    const timeSlot = `${hour}:${minute}`;
    
    if (filterPastTimes && date === today) {
      const slotDateTime = new Date(`${date}T${timeSlot}:00`);
      if (slotDateTime > now) {
        slots.push(timeSlot);
      }
    } else {
      slots.push(timeSlot);
    }
    
    current = new Date(current.getTime() + slotIntervalMinutes * 60000);
  }
  return slots;
}

function canAccommodateDuration(date, timeSlot, durationMinutes, existingAppointments) {
  const requestedStart = new Date(`${date}T${timeSlot}:00`);
  const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60000);

  const dayName = requestedStart.toLocaleDateString('pl-PL', { weekday: 'long' }).toLowerCase();
  const hours = BUSINESS_HOURS[dayName];
  if (!hours || hours.start === 'closed' || hours.end === 'closed') return false;

  const businessStart = new Date(`${date}T${hours.start}:00`);
  const businessEnd = new Date(`${date}T${hours.end}:00`);
  if (requestedStart < businessStart || requestedEnd > businessEnd) return false;

  for (const appointment of existingAppointments) {
    const apptStart = new Date(`${appointment.date}T${appointment.timeSlot}:00`);
    const apptEnd = new Date(apptStart.getTime() + appointment.duration * 60000);
    if (requestedStart < apptEnd && requestedEnd > apptStart) return false;
  }
  return true;
}

async function getWeeklySchedule(startDate, duration) {
  const week = [];
  let current = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const dateStr = current.toISOString().slice(0, 10);
    const slots = generateTimeSlots(dateStr, 15);
    const existingAppointments = await Appointment.find({ date: dateStr });
    const availableSlots = slots.filter(slot =>
      canAccommodateDuration(dateStr, slot, duration, existingAppointments)
    );
    week.push({ date: dateStr, slots: availableSlots });
    current.setDate(current.getDate() + 1);
  }
  return week;
}

module.exports = {
  SERVICE_DURATIONS,
  BUSINESS_HOURS,
  generateTimeSlots,
  canAccommodateDuration,
  getWeeklySchedule
};
