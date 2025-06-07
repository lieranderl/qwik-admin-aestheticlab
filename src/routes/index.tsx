import { component$, useSignal, } from "@builder.io/qwik";
import { TechnicianResponse } from "~/types";
import { DocumentHead } from "@builder.io/qwik-city";
import { TechMultiSelect } from "~/components/multiselect";
import { BookingCalendar } from "~/components/CalendarView/calendar-view";
import { useTechnicians } from "./layout";

export default component$(() => {
  const technicians = useTechnicians();
  const filteredTechnicians = useSignal<TechnicianResponse[]>([]);


  return <div class="flex flex-col lg:flex-row gap-4 p-4">
  {/* Sidebar with technician multi-select */}
  <div class="lg:w-1/4 w-full">
    <div class="card shadow-md bg-base-100">
      <div class="card-body">
        <h2 class="card-title text-lg mb-2">Technicians</h2>
        <TechMultiSelect technicians={technicians.value.data || []} selectedTechnicians={filteredTechnicians} />
      </div>
    </div>
  </div>

  {/* Main calendar view */}
  <div class="lg:w-3/4 w-full">
    <div class="card shadow-md bg-base-100 h-full">
      <div class="card-body p-4">
        <BookingCalendar selectedTechnicians={filteredTechnicians} />
      </div>
    </div>
  </div>
</div>

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
