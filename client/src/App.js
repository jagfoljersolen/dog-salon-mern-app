import { Route, Routes, Navigate } from "react-router-dom"
import Main from "./components/Main"
import Signup from "./components/Signup"
import Login from "./components/Login"
import AppointmentHistory from "./components/ManageAppointment/AppointmentHistory";

function App() {
  const user = localStorage.getItem("token")
  
  return (
    <Routes>
      {user && <Route path="/" exact element={<Main />} />}
      {user && <Route path="/appointment-history" element={<AppointmentHistory />} /> }

      <Route path="/signup" exact element={<Signup />} />
      <Route path="/login" exact element={<Login />} />
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/appointment-history" element={<Navigate replace to="/login" />} />

   </Routes>
  )
}
export default App

