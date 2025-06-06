import { component$, useSignal, } from "@builder.io/qwik";
import { TechnicianResponse } from "~/types";
import { DocumentHead } from "@builder.io/qwik-city";
import { TechMultiSelect } from "~/components/multiselect";
import { BookingCalendar } from "~/components/CalendarView/calendar-view";
import { useTechnicians } from "./layout";

export default component$(() => {
  const technicians = useTechnicians();
  const filteredTechnicians = useSignal<TechnicianResponse[]>([]);


  return <div>
    <TechMultiSelect technicians={technicians.value.data || []} selectedTechnicians={filteredTechnicians} />
    <BookingCalendar selectedTechnicians={filteredTechnicians} />
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
