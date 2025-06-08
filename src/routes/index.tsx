import { component$, useSignal, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { BookingCalendar } from "~/components/CalendarView/calendar-view";
import { TechMultiSelect } from "~/components/Selection/multiselect";
import { Statistics } from "~/components/Stats/statistics";
import type { CalendarStore, TechnicianResponse } from "~/types";
import { useTechnicians } from "./layout";

export default component$(() => {
  const technicians = useTechnicians();
  const filteredTechnicians = useSignal<TechnicianResponse[]>([]);
  const calendarStore = useStore({
    activeStart: new Date(),
    activeEnd: new Date(),
    viewType: "timeGridWeek",
    events: [],
    currentEnd: new Date(),
    currentStart: new Date(),
  } as CalendarStore);

  return (
    <div class="flex flex-col lg:flex-row gap-4 p-4">
      {/* Sidebar with technician multi-select and statistics */}
      <div class="lg:w-1/4 w-full flex flex-col gap-4">
        {/* Technician selector */}

        <TechMultiSelect
          technicians={technicians.value.data || []}
          selectedTechnicians={filteredTechnicians}
        />

        {/* Statistics */}
        <Statistics
          selectedTechnicians={filteredTechnicians}
          calendarStore={calendarStore}
        />


      </div>

      {/* Main calendar view */}
      <div class="lg:w-3/4 w-full">
        <div class="card shadow-md h-full">
          <div class="card-body p-4">
            <BookingCalendar
              selectedTechnicians={filteredTechnicians}
              calendarStore={calendarStore}
            />
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
