import { supabaseBrowser } from "~/supabase/client";
import { APIResponse, BookingResponse, ClientResponse, ServiceResponse, TechnicianResponse } from "~/types";

// fetch all services
export async function fetchServices(): Promise<APIResponse<ServiceResponse[]>> {

  // if active is true, then fetch only active services
  const { data, error } = await supabaseBrowser
    .from("services")
    .select(`id, name, price, duration, active`)
    .eq("active", true);

  console.log("Services fetched", data, error);

  if (error) {
    return { success: false, error: error.message };
  }

  const result: ServiceResponse[] = data;

  return { success: true, data: result };
}


// get client details by id
export async function fetchClient(client_id: string): Promise<APIResponse<ClientResponse>> {
  const { data, error } = await supabaseBrowser
    .from("clients")
    .select(`id, name, email, phone`)
    .eq("id", client_id);

  console.log("Client details fetched", data, error);

  if (error) {
    return { success: false, error: error.message };
  }

  const result: ClientResponse = data[0];

  return { success: true, data: result };
}

// get all technicians
export async function fetchTechnicians(): Promise<APIResponse<TechnicianResponse[]>> {
  const { data, error } = await supabaseBrowser
    .from("technicians")
    .select(`id, name, email, role, active`)
    .eq("active", true);

  console.log("Technicians fetched", data, error);

  if (error) {
    return { success: false, error: error.message };
  }

  const result: TechnicianResponse[] = data;

  return { success: true, data: result };
}


export async function fetchBookings(technician_id: string, technician_name: string, services: ServiceResponse[], from: string, to: string): Promise<APIResponse<BookingResponse[]>> {

  let db_query = supabaseBrowser
    .from("bookings")
    .select(`*, clients(name, phone)`)
    .order("datetime", { ascending: true });

  if (from) db_query = db_query.gte("datetime", from);
  if (to) db_query = db_query.lte("datetime", to);
  if (technician_id) db_query = db_query.eq("technician_id", technician_id);

  const { data, error } = await db_query;

  console.log("Bookings fetched", data, error);

  if (error) {
    return { success: false, error: error.message };
  }

  const result: BookingResponse[] = data.map((b: any) => ({
    ...b,
    client_name: b.clients.name,
    client_phone: b.clients.phone,
    client_email: b.clients.email,
    technician_name: technician_name,
    services_names: services.filter((s: ServiceResponse) => b.services.includes(s.id)).map((s: ServiceResponse) => s.name),
  }));

  return { success: true, data: result };
}

