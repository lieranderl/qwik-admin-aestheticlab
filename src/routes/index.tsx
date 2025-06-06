import { component$, Resource, useComputed$, useResource$, useSignal, } from "@builder.io/qwik";
import { fetchBookings } from "~/api/bookings/get";
import { TechnicianResponse } from "~/types";
import { DocumentHead } from "@builder.io/qwik-city";
import { TechMultiSelect } from "~/components/multiselect";
import { BookingCalendar } from "~/components/CalendarView/calendar-view";
import { useServices, useTechnicians } from "./layout";
import { DateTime } from "luxon";


const from = DateTime.now().minus({ months: 1 }).startOf("month").toFormat("yyyy-MM-dd");
// const to = DateTime.now().plus({ months: 3 }).startOf("month").toFormat("yyyy-MM-dd");


export default component$(() => {
  const technicians = useTechnicians();
  const filteredTechnicians = useSignal<TechnicianResponse[]>([]);
  const services = useServices();
  const viewSig = useSignal("timeGridWeek");
  const startDate = useSignal(from)
  const endDate = useComputed$(() => {
    return DateTime.fromISO(startDate.value)
      .plus({ months: 1 })
      .endOf("month")
      .toFormat("yyyy-MM-dd");
  });

  const bookingsResource = useResource$(async ({ track }) => {
    track(() => filteredTechnicians.value);
  
    // go over technicians and fetch bookings for each
    if (filteredTechnicians.value) {
      const bookings = filteredTechnicians.value.map(async (technician) => {
        return await fetchBookings(technician.id, technician.name, services.value.data || [], startDate.value, endDate.value);
      });

      const BookingResponse = await Promise.all(bookings);
      return BookingResponse.map((b) => b.data || []).flat();
    }
    return [];
  });




  return <div>
    <TechMultiSelect technicians={technicians.value.data || []} selectedTechnicians={filteredTechnicians} />

    <BookingCalendar events={bookings || []} viewSig={viewSig} startDate={startDate} />


    {/* <Resource value={bookingsResource}
      onPending={() => <div>Loading...</div>}
      onResolved={(bookings) =>
        <BookingCalendar events={bookings || []} viewSig={viewSig} startDate={startDate} />
      }
      onRejected={(error) => <div> {error.message} </div>} /> */}


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
