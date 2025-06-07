// Shared types for Admin API project

export interface ServiceFiltered {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  created_at: string;
  priority: number;
  category_id: ServiceCategory["id"];
}

export interface Service extends ServiceFiltered {
  name_ru: string;
  name_nl: string;
  name_fr: string;
  name_uk: string;
  description_ru: string;
  description_nl: string;
  description_fr: string;
  description_uk: string;
  active: boolean;
}

export interface ServiceCategoryFiltered {
  id: string;
  name: string;
}

export interface ServiceCategory extends ServiceCategoryFiltered {
  name_ru: string;
  name_nl: string;
  name_fr: string;
  name_uk: string;
  active: boolean;
}

export interface TimeSlot {
  start: string; // ISO datetime
  end: string;   // ISO datetime
  status: "available" | "busy";
}

export interface WorkingHours {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

export interface Technician {
  id: string;
  name: string;
  photo_url: string;
  email: string;
  calendar_id: string;
  services: string[];
  working_hours: WorkingHours;
  created_at: string;
  active: boolean;
  about: string;
  about_ru: string;
  about_nl: string;
  about_fr: string;
  about_uk: string;
  role: string;
  color: string
}

export interface TechnicianResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string
}

export interface ClientResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface TechnicianSlots {
  tech: Technician;
  slots: TimeSlot[];
}

export interface Booking {
  id: string;
  technician_id: Technician["id"];
  client_id: string;
  services: string[];
  services_names: string[];
  duration: number;
  price: number;
  datetime: string; // ISO string
  calendar_id: string;
  event_id: string;
  technician_name: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

// Additional types for API usage
export interface CreateBookingPayload {
  technician_id: string;
  client_id: string;
  services: string[];
  datetime: string; // ISO string
}

export interface UpdateBookingPayload {
  id: string;
  services?: string[];
  datetime?: string;
}

export interface DeleteBookingPayload {
  id: string;
}

export interface BookingResponse extends Booking {
  client_name: string;
  client_phone: string;
  client_email: string;
  color: string;
}

export interface ServiceResponse {
  id: string;
  name: string;
  price: number;
  duration: number;
  active: boolean;
}



export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// GET: /api/bookings
export type GetBookingsQuery = {
  from?: string; // ISO
  to?: string;   // ISO
  technician_id?: string;
};

// POST: /api/bookings/create
export type CreateBookingRequest = CreateBookingPayload;
export type CreateBookingResult = APIResponse<BookingResponse>;
