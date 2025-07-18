require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const connection = require('./db')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const appointmentRoutes = require('./routes/appointments')

connection()

//middleware
app.use(express.json())
app.use(cors())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/appointments', appointmentRoutes)



const port = process.env.PORT || 8080

app.listen(port, () => console.log(`Nasłuchiwanie na porcie ${port}`))

