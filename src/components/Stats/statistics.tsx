import { component$ } from "@builder.io/qwik";
import { CalendarProps } from "../CalendarView/calendar-view";

function formatMinutes(minutes: number) {
    if (minutes < 60) return `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
}

export const Statistics = component$(({ selectedTechnicians, calendarStore }: CalendarProps) => {
    return (
        <div class="card bg-base-200 shadow-md">
            <div class="card-body">
                <h2 class="card-title text-xl font-bold">Statistics</h2>

                {selectedTechnicians.value.length === 0 ? (
                    <p class="text-gray-400 italic">No technicians selected.</p>
                ) : (
                    <div class="space-y-4">
                        {selectedTechnicians.value.map((tech) => {
                            const techEvents = calendarStore.events.filter(e => {
                                const eventDate = new Date(e.datetime);
                                return (
                                    e.technician_id === tech.id &&
                                    eventDate >= calendarStore.currentStart &&
                                    eventDate <= calendarStore.currentEnd
                                );
                            });
                            const workingDays = new Set(
                                techEvents.map((e) => new Date(e.datetime).toDateString())
                            );
                            const totalMinutes = techEvents.reduce(
                                (sum, e) => sum + (e.duration || 0),
                                0
                            );
                            const uniqueClients = new Set(
                                techEvents.map((e) => e.client_id)
                            ).size;

                            const serviceCounts: Record<string, number> = {};
                            techEvents.forEach(e => {
                                e.services_names.forEach(service => {
                                    serviceCounts[service] = (serviceCounts[service] || 0) + 1;
                                });
                            });

                            const totalMoney = techEvents.reduce((sum, e) => sum + (e.price || 0), 0);

                            return (
                                <div key={tech.id} class="bg-base-200 rounded-lg p-4 shadow">
                                    <h3 class="text-lg font-semibold mb-4 text-accent">{tech.name}</h3>

                                    <div class="grid grid-cols-3 text-sm bg-base-100 ">

                                        {/* Row 1: Money Earned & Days Worked side by side, full width */}
                                        <div class="col-span-3 flex ">
                                            <div class="flex-1 p-2 border border-neutral text-center">
                                                <div class="font-semibold text-xs text-gray-600">Money Earned</div>
                                                <div class="font-bold">€{totalMoney}</div>
                                            </div>
                                            <div class="flex-1 p-2 border border-neutral text-center">
                                                <div class="font-semibold text-xs text-gray-600">Days Worked</div>
                                                <div class="font-bold">{workingDays.size}</div>
                                            </div>
                                        </div>

                                        {/* Row 2: Working Time full width */}
                                        <div class="col-span-3 p-2 border border-neutral text-center">
                                            <div class="font-semibold text-xs text-gray-600">Working Time</div>
                                            <div class="font-bold">{formatMinutes(totalMinutes)}</div>
                                        </div>

                                        {/* Row 3: Bookings & Unique Clients side by side, full width */}
                                        <div class="col-span-3 flex ">
                                            <div class="flex-1 p-2 border border-neutral text-center">
                                                <div class="font-semibold text-xs text-gray-600">Bookings</div>
                                                <div class="font-bold">{techEvents.length}</div>
                                            </div>
                                            <div class="flex-1 p-2 border border-neutral text-center">
                                                <div class="font-semibold text-xs text-gray-600">Unique Clients</div>
                                                <div class="font-bold">{uniqueClients}</div>
                                            </div>
                                        </div>

                                    </div>




                                    <div class="mt-5">
                                        <strong class="block mb-2 text-base">Services:</strong>
                                        <ul class="text-sm rounded-md bg-base-100 p-2 border border-base-300">
                                            {Object.entries(serviceCounts)
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([service, count]) => (
                                                    <li key={service} class="py-1 flex justify-between">
                                                        <span class="font-medium">{service}</span>
                                                        <span class="font-semibold">{count}</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>


                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});
