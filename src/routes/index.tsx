import { component$, useSignal, useStore } from "@builder.io/qwik";
import { CalendarStore, TechnicianResponse } from "~/types";
import { DocumentHead } from "@builder.io/qwik-city";
import { TechMultiSelect } from "~/components/Selection/multiselect";
import { BookingCalendar } from "~/components/CalendarView/calendar-view";
import { useTechnicians } from "./layout";
import { Statistics } from "~/components/Stats/statistics";





export default component$(() => {
  const technicians = useTechnicians();
  const filteredTechnicians = useSignal<TechnicianResponse[]>([]);
  const calendarStore = useStore({
    activeStart: new Date,
    activeEnd: new Date,
    viewType: "timeGridWeek",
    events: [],
    currentEnd: new Date,
    currentStart: new Date
  } as CalendarStore)


  return (
    <div class="flex flex-col lg:flex-row gap-4 p-4">
      {/* Sidebar with technician multi-select and statistics */}
      <div class="lg:w-1/4 w-full flex flex-col gap-4">
        {/* Technician selector */}
        <div class="card bg-base-100">
          <div class="card-body">
            <h2 class="card-title text-lg mb-2">Technicians</h2>
            <TechMultiSelect
              technicians={technicians.value.data || []}
              selectedTechnicians={filteredTechnicians}
            />
          </div>
        </div>

        {/* Statistics */}
        <Statistics selectedTechnicians={filteredTechnicians} calendarStore={calendarStore} />
      </div>

      {/* Main calendar view */}
      <div class="lg:w-3/4 w-full">
        <div class="card bg-base-100 h-full">
          <div class="card-body p-4">
            <BookingCalendar selectedTechnicians={filteredTechnicians} calendarStore={calendarStore} />
          </div>
        </div>
      </div>
    </div>
  );
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
