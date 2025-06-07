import { component$, useSignal, noSerialize, type NoSerialize, useStore, Signal, useOnDocument, $, useTask$ } from "@builder.io/qwik";
import { Calendar, DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { TechnicianResponse } from "~/types";
import { DateTime } from 'luxon';
import { fetchBookings } from "~/api/bookings/get";
import { useServices } from "~/routes/layout";
import { AestheticCalendar } from "./calendar-init";
import { EventResizeDoneArg } from "@fullcalendar/interaction/index.js";



export type CalendarProps = {
    selectedTechnicians: Signal<TechnicianResponse[]>;
}

export const BookingCalendar = component$(({ selectedTechnicians }: CalendarProps) => {
    const calendarRef = useSignal<HTMLElement>();
    const calendarInstance = useSignal<NoSerialize<Calendar> | null>(null);
    const services = useServices();

    const viewSig = useSignal("timeGridWeek")
    const startDate = useSignal(new Date);
    const endDate = useSignal(new Date);


    const modalRef = useSignal<HTMLDialogElement>();
    const modal = useStore({
        event: {
            id: '',
            title: '',
            start: null as Date | null,
            end: null as Date | null,
            duration: 0,
        },
    });

    const EventClick = $((info: EventClickArg) => {
        const event = info.event;
        console.log(event.start);
        console.log(event.start?.toISOString());
        modal.event = {
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            duration: (event.end!.getTime() - event.start!.getTime()) / 60000 || 0,
        };
        modalRef.value?.showModal();
        info.jsEvent.preventDefault();
    });

    const SelectClick = $((info: DateSelectArg) => {
        console.log(info);
        modalRef.value?.showModal();
    })

    const eventResize = $((info: EventResizeDoneArg) => {
        console.log(info);
    })

    const eventDrop = $((info: EventDropArg) => {
        console.log(info);
    })


    useOnDocument('DOMContentLoaded', $(() => {
        if (!calendarInstance.value && calendarRef.value) {
            const calendar = AestheticCalendar(calendarRef.value, EventClick, SelectClick, eventResize, eventDrop, viewSig, startDate, endDate)
            calendar.render();
            calendarInstance.value = noSerialize(calendar);
        }
    }));



    useTask$(async ({ track }) => {
        track(() => startDate.value || endDate.value)
        track(() => selectedTechnicians.value)
        if (!calendarInstance.value) return;

        const calendar = calendarInstance.value;
        calendar.removeAllEvents();

        if (selectedTechnicians.value) {
            const bookings = selectedTechnicians.value.map(async (technician) => {
                return await fetchBookings(technician.id, technician.name, technician.color, services.value.data || [], startDate.value.toISOString(), endDate.value.toISOString());
            });

            const BookingResponse = await Promise.all(bookings);
            const events = BookingResponse.map((b) => b.data || []).flat();
            events.forEach((b) => {
                calendar.addEvent({
                    id: b.id,
                    title: b.technician_name + " | " + b.client_name + " | " + b.services_names.join(", "),
                    start: b.datetime,
                    end: new Date(new Date(b.datetime).getTime() + b.duration * 60000).toISOString(),
                    color: b.color,
                    textColor: "black"

                });
            });
        } else {
            calendar.removeAllEvents();
        }
    })

    return <>

        <div ref={calendarRef} class="rounded-box overflow-hidden" />

        <dialog ref={modalRef} id="editModal" class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">Edit Booking</h3>

                <div class="form-control mb-2">
                    <label class="label">Title</label>
                    <input type="text" class="input input-bordered" value={modal.event.title}
                        onInput$={(e) => modal.event.title = (e.target as HTMLInputElement).value} />
                </div>

                <div class="form-control mb-2">
                    <label class="label">Start Time</label>
                    <input
                        type="datetime-local"
                        class="input input-bordered"
                        value={modal.event.start ? DateTime.fromJSDate(modal.event.start).toFormat("yyyy-MM-dd'T'HH:mm") : ""}
                        onInput$={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            modal.event.start = val ? new Date(val) : null;
                        }}
                    />
                </div>

                <div class="form-control mb-4">
                    <label class="label">Duration (minutes)</label>
                    <input type="number" class="input input-bordered" value={modal.event.duration}
                        onInput$={(e) => modal.event.duration = parseInt((e.target as HTMLInputElement).value)} />
                </div>

                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn">Cancel</button>
                    </form>
                    <button class="btn btn-primary" onClick$={() => {
                        console.log("Saving:", modal.event);
                        modalRef.value?.close();
                    }}>Save</button>
                </div>
            </div>
        </dialog>
    </>;
});
