import { create } from 'zustand'
import type { Business, Service, Staff, Slot } from '@/types'

interface BookingState {
  step: number
  businessSlug: string | null
  business: Business | null
  selectedService: Service | null
  selectedStaff: Staff | null
  selectedDate: string | null
  selectedSlot: Slot | null
  customerNotes: string
  appointmentId: string | null
  paymentIntentId: string | null
  clientSecret: string | null

  setStep: (step: number) => void
  setBusiness: (business: Business) => void
  setService: (service: Service) => void
  setStaff: (staff: Staff | null) => void
  setDate: (date: string) => void
  setSlot: (slot: Slot) => void
  setNotes: (notes: string) => void
  setAppointment: (id: string) => void
  setPayment: (intentId: string, secret: string) => void
  reset: () => void
}

const initialState = {
  step: 1,
  businessSlug: null,
  business: null,
  selectedService: null,
  selectedStaff: null,
  selectedDate: null,
  selectedSlot: null,
  customerNotes: '',
  appointmentId: null,
  paymentIntentId: null,
  clientSecret: null,
}

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setBusiness: (business) => set({ business, businessSlug: business.slug }),
  setService: (service) => set({ selectedService: service, step: 2 }),
  setStaff: (staff) => set({ selectedStaff: staff, step: 3 }),
  setDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  setNotes: (notes) => set({ customerNotes: notes }),
  setAppointment: (id) => set({ appointmentId: id, step: 5 }),
  setPayment: (intentId, secret) => set({ paymentIntentId: intentId, clientSecret: secret }),
  reset: () => set(initialState),
}))
