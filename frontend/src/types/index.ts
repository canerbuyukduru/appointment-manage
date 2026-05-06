export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  parentId?: string
  isActive: boolean
  order: number
}

export interface Business {
  id: string
  slug: string
  name: string
  categoryId: string
  description?: string
  logo?: string
  coverImage?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  ratingAverage: number
  ratingCount: number
  createdAt?: string
  category?: Category
  services?: Service[]
  staff?: Staff[]
  businessHours?: BusinessHour[]
  cancellationPolicy?: CancellationPolicy
  reviews?: Review[]
  owner?: { id: string; firstName: string; lastName: string; email: string }
}

export interface Service {
  id: string
  businessId: string
  name: string
  description?: string
  duration: number
  price: number | string
  image?: string
  isActive: boolean
  category?: Category
  staff?: { staff: { id: string; name: string } }[]
}

export interface Staff {
  id: string
  businessId: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  specialization?: string
  bio?: string
  isActive: boolean
  workingHours?: StaffWorkingHour[]
  services?: { service: { id: string; name: string } }[]
}

export interface StaffWorkingHour {
  id?: string
  staffId?: string
  dayOfWeek: number
  isAvailable: boolean
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}

export interface BusinessHour {
  id?: string
  businessId?: string
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
  breakStart?: string
  breakEnd?: string
}

export interface CancellationPolicy {
  id: string
  businessId: string
  hoursBeforeAppointment: number
  refundPercentage: number
  policyText?: string
}

export interface Slot {
  startTime: string
  endTime: string
  staffId: string
  staffName: string
}

export interface Appointment {
  id: string
  businessId: string
  customerId: string
  serviceId: string
  staffId: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  customerNotes?: string
  businessNotes?: string
  cancellationReason?: string
  totalPrice: number | string
  createdAt: string
  business?: Pick<Business, 'id' | 'name' | 'slug' | 'logo' | 'address' | 'phone'>
  service?: Pick<Service, 'id' | 'name' | 'duration'>
  staff?: Pick<Staff, 'id' | 'name' | 'avatar'>
  customer?: { firstName: string; lastName: string; email: string; phone?: string }
  payment?: Payment
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'started'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_business'
  | 'no_show'

export interface Payment {
  id: string
  appointmentId: string
  amount: number | string
  commissionAmount: number | string
  netAmount: number | string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
  transactionId?: string
  refundAmount?: number | string
  refundedAt?: string
  createdAt: string
}

export interface Review {
  id: string
  businessId: string
  customerId: string
  rating: number
  comment?: string
  createdAt: string
  customer?: { firstName: string; lastName: string; avatar?: string }
}

export interface AdminStats {
  totalBusinesses: number
  pendingBusinesses: number
  totalUsers: number
  totalAppointments: number
  totalRevenue: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface PaginatedApiResponse<T> {
  success: boolean
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
  }
}
