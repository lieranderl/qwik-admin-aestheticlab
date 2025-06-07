import { component$ } from "@builder.io/qwik";
import { CalendarProps } from "../CalendarView/calendar-view";

function formatMinutes(minutes: number) {
    if (minutes < 60) return `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
}


export const Statistics = component$(({ selectedTechnicians, calendarStore }: CalendarProps) => {


    return <div class="card bg-base-100">
        <div class="card-body">
            <h2 class="card-title text-lg mb-2">Statistics</h2>
            {selectedTechnicians.value.length === 0 ? (
                <p class="text-gray-500">No technicians selected.</p>
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

                        // Count services
                        const serviceCounts: Record<string, number> = {};
                        techEvents.forEach(e => {
                            e.services_names.forEach(service => {
                                serviceCounts[service] = (serviceCounts[service] || 0) + 1;
                            });
                        });

                        return (
                            <div key={tech.id} class="bg-base-200 rounded p-3 shadow-sm">
                                <h3 class="font-semibold text-base">{tech.name}</h3>
                                <ul class="text-sm mt-1 space-y-1">
                                    <li>
                                        <strong>Money Earned:</strong> €
                                        {techEvents.reduce((sum, e) => sum + (e.price || 0), 0)}
                                    </li>

                                    <li>
                                        <strong>Days Worked:</strong> {workingDays.size}
                                    </li>
                                    <li>
                                        <strong>Working Time:</strong> {formatMinutes(totalMinutes)}
                                    </li>
                                    <li>
                                        <strong>Bookings:</strong> {techEvents.length}
                                    </li>
                                    <li>
                                        <strong>Unique Clients:</strong> {uniqueClients}
                                    </li>

                                    <li>
                                        <strong>Services:</strong>
                                        <ul class="ml-4 list-disc">
                                            {Object.entries(serviceCounts)
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([service, count]) => (
                                                    <li key={service}>{service}: {count}</li>
                                                ))}
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
})