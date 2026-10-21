
import { useEffect, useState } from "react";

import type { Appointment } from "../../../types/appointment";

import {
  loadAppointments,
  saveAppointments,
} from "../appointmentStorage";

export function useAppointments() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(loadAppointments);

  useEffect(() => {
    saveAppointments(appointments);
  }, [appointments]);

  function addAppointment(appointment: Appointment) {
    setAppointments((previous) => [
      ...previous,
      appointment,
    ]);
  }

  function cancelAppointment(id: string) {
    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: "İptal" }
          : appointment
      )
    );
  }

  return {
    appointments,
    addAppointment,
    cancelAppointment,
  };
}
