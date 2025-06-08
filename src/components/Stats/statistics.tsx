import { component$, useResource$, Resource } from "@builder.io/qwik";
import type { CalendarProps } from "../CalendarView/calendar-view";
import type { BookingResponse } from "~/types";

interface TechStats {
  id: string;
  name: string;
  workingDays: number;
  totalMinutes: number;
  uniqueClients: number;
  serviceCounts: Record<string, number>;
  totalMoney: number;
  eventCount: number;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs} hr${hrs > 1 ? "s" : ""}${mins > 0 ? ` ${mins} min${mins !== 1 ? "s" : ""}` : ""}`;
}

const calculateTechStats = (
  tech: { id: string; name: string },
  events: BookingResponse[],
  start: Date,
  end: Date,
): TechStats => {
  const techEvents = [];
  const dateStrings = new Set<string>();
  const clientIds = new Set<string>();
  let totalMinutes = 0;
  let totalMoney = 0;
  const serviceCounts: Record<string, number> = {};

  // First pass: filter and collect basic metrics
  for (const event of events) {
    const eventDate = new Date(event.datetime);
    if (
      event.technician_id === tech.id &&
      eventDate >= start &&
      eventDate <= end
    ) {
      techEvents.push(event);
      dateStrings.add(eventDate.toDateString());
      clientIds.add(event.client_id);
      totalMinutes += event.duration || 0;
      totalMoney += event.price || 0;

      if (event.services_names) {
        for (const service of event.services_names) {
          serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        }
      }
    }
  }

  return {
    id: tech.id,
    name: tech.name,
    workingDays: dateStrings.size,
    totalMinutes,
    uniqueClients: clientIds.size,
    serviceCounts,
    totalMoney,
    eventCount: techEvents.length,
  };
};

export const Statistics = component$(
  ({ selectedTechnicians, calendarStore }: CalendarProps) => {
    const statsResource = useResource$<TechStats[]>(async ({ track }) => {
      track(() => selectedTechnicians.value);
      track(() => calendarStore.events);
      track(() => calendarStore.currentStart);
      track(() => calendarStore.currentEnd);

      return selectedTechnicians.value.map((tech) =>
        calculateTechStats(
          tech,
          calendarStore.events,
          calendarStore.currentStart,
          calendarStore.currentEnd,
        ),
      );
    });

    return (
      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <h2 class="card-title text-xl font-bold">Statistics</h2>
          <Resource
            value={statsResource}
            onPending={() => (
              <p class="text-gray-400 italic">Loading statistics...</p>
            )}
            onRejected={() => (
              <p class="text-red-500">Error loading statistics</p>
            )}
            onResolved={(stats) =>
              stats.length === 0 ? (
                <p class="text-gray-400 italic">No technicians selected.</p>
              ) : (
                <div class="space-y-4">
                  {stats.map((tech) => (
                    <TechStatsCard key={tech.id} tech={tech} />
                  ))}
                </div>
              )
            }
          />
        </div>
      </div>
    );
  },
);

const TechStatsCard = component$<{ tech: TechStats }>(({ tech }) => (
  <div class="bg-base-200 rounded-lg p-4 shadow">
    <h3 class="text-lg font-semibold mb-4 text-accent">{tech.name}</h3>
    <div class="grid grid-cols-3 text-sm bg-base-100">
      <div class="col-span-3 flex">
        <StatBox label="Money Earned" value={`€${tech.totalMoney}`} />
        <StatBox label="Days Worked" value={tech.workingDays} />
      </div>
      <div class="col-span-3">
        <StatBox
          label="Working Time"
          value={formatMinutes(tech.totalMinutes)}
        />
      </div>
      <div class="col-span-3 flex">
        <StatBox label="Bookings" value={tech.eventCount} />
        <StatBox label="Unique Clients" value={tech.uniqueClients} />
      </div>
    </div>
    <ServiceList serviceCounts={tech.serviceCounts} />
  </div>
));

const StatBox = component$<{ label: string; value: string | number }>(
  ({ label, value }) => (
    <div class="flex-1 p-2 border border-neutral text-center">
      <div class="font-semibold text-xs text-gray-600">{label}</div>
      <div class="font-bold">{value}</div>
    </div>
  ),
);

const ServiceList = component$<{ serviceCounts: Record<string, number> }>(
  ({ serviceCounts }) => {
    const sortedServices = Object.entries(serviceCounts).sort(
      (a, b) => b[1] - a[1],
    );

    return (
      <div class="mt-5">
        <strong class="block mb-2 text-base">Services:</strong>
        <ul class="text-sm rounded-md bg-base-100 p-2 border border-base-300">
          {sortedServices.map(([service, count]) => (
            <li key={service} class="py-1 flex justify-between">
              <span class="font-medium">{service}</span>
              <span class="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);
