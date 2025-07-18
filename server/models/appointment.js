const mongoose = require('mongoose');
const Joi = require('joi');

const SERVICES = [
  "Kąpiel i suszenie",
  "Strzyżenie",
  "Trymowanie",
  "Obcinanie pazurów",
  "Czyszczenie uszu"
];

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  phone: { type: String, required: true },
  note: { type: String },
  services: { type: [String], required: true },
  duration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});


appointmentSchema.index({ date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

const validateAppointment = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label('Imię zwierzaka'),
    date: Joi.string().isoDate().required().label('Data'),
    timeSlot: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required()
      .label('Godzina wizyty'),
    phone: Joi.string().min(7).max(20).required().label('Telefon'),
    note: Joi.string().allow('').optional().label('Notatka'),
    services: Joi.array()
      .items(Joi.string().valid(...SERVICES))
      .min(1)
      .required()
      .label('Usługi')
  });
  return schema.validate(data);
};

module.exports = { Appointment, validateAppointment };
