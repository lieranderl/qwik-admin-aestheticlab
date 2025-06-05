import { component$, Resource, useResource$, useSignal, } from "@builder.io/qwik";
import { fetchBookings } from "~/api/bookings/get";
import { TechnicianResponse } from "~/types";
import { DocumentHead, useLocation } from "@builder.io/qwik-city";
import { TechMultiSelect } from "~/components/multiselect";
import { BookingCalendar } from "~/components/CalendarView/calendar-view";
import { useServices, useTechnician } from "./layout";



export default component$(() => {
  const location = useLocation();
  const technicians = useTechnician();
  const filteredTechnicians = useSignal<TechnicianResponse[]>([]);
  const services = useServices();
  const bookingsResource = useResource$(async ({ track }) => {
    track(() => filteredTechnicians.value);
    // go over technicians and fetch bookings for each
    if (filteredTechnicians.value) {
      const bookings = filteredTechnicians.value.map(async (technician) => {
        return await fetchBookings(technician.id, technician.name, services.value.data || [], location.url.searchParams.get("from") || "2025-01-01", location.url.searchParams.get("to") || "2025-01-31");
      });

      const BookingResponse = await Promise.all(bookings);
      return BookingResponse.map((b) => b.data || []).flat();
    }
    return [];
  });




  return <div>
    <TechMultiSelect technicians={technicians.value.data || []} selectedTechnicians={filteredTechnicians} />


    <Resource value={bookingsResource}
      onPending={() => <div>Loading...</div>}
      onResolved={(bookings) =>
        <BookingCalendar events={bookings || []} />
      }
      onRejected={(error) => <div> {error.message} </div>} />


  </div>;
});



export const head: DocumentHead = {
  title: "Test multiselect",
  meta: [
    {
      name: "description",
      content: "Admin calendar for technician bookings",
    },
  ],
};
