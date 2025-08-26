"use client"
import React from 'react'
import { useGetMyAppointmentsQuery } from '@/lib/services/appointmentApi'
const AppointmentsPage = () => {
  const { data: appointments, isLoading } = useGetMyAppointmentsQuery()

  if (isLoading) {
    return <div>Loading...</div>
  }

  console.log(appointments?.serviceSnapshot)
  return (
    <div>
      <h1>My Appointments</h1>
      <ul>
        {appointments?.map(appointment => (
          <li key={appointment._id}>
            {appointment.serviceSnapshot?.name} - {appointment.serviceSnapshot?.price}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AppointmentsPage