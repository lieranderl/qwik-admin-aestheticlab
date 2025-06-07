import { component$, createContextId, NoSerialize, useSignal } from "@builder.io/qwik";
import { TechnicianResponse } from "~/types";
import { DocumentHead } from "@builder.io/qwik-city";
import { TechMultiSelect } from "~/components/Selection/multiselect";
import { BookingCalendar } from "~/components/CalendarView/calendar-view";
import { useTechnicians } from "./layout";
import { Calendar } from "@fullcalendar/core/index.js";



// export const CalendarContext = createContextId<NoSerialize<Calendar> | null>(
//   'docs.theme-context'
// );


export default component$(() => {
  const technicians = useTechnicians();
  const filteredTechnicians = useSignal<TechnicianResponse[]>([]);


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
        <div class="card bg-base-100">
          <div class="card-body">
            <h2 class="card-title text-lg mb-2">Statistics</h2>
            {filteredTechnicians.value.length === 0 ? (
              <p class="text-gray-500">No technicians selected.</p>
            ) : (
              <div class="space-y-4">
                {filteredTechnicians.value.map((tech) => (
                  <div key={tech.id} class="bg-base-200 rounded p-3 shadow-sm">
                    <h3 class="font-semibold text-base">{tech.name}</h3>
                    <ul class="text-sm mt-1 space-y-1">
                      <li><strong>Days Worked:</strong> 12</li>
                      <li><strong>Money Earned:</strong> €1,200</li>
                      <li><strong>Clients:</strong> 18</li>
                      <li><strong>Services:</strong> Haircut, Massage</li>
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main calendar view */}
      <div class="lg:w-3/4 w-full">
        <div class="card bg-base-100 h-full">
          <div class="card-body p-4">
            <BookingCalendar selectedTechnicians={filteredTechnicians} />
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
