import { component$, useSignal, noSerialize, type NoSerialize, useVisibleTask$, useStore, Signal } from "@builder.io/qwik";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import luxonPlugin from "@fullcalendar/luxon3";
import { BookingResponse } from "~/types";
import { DateTime } from 'luxon';


export type CalendarProps = {
    events: BookingResponse[],
    viewSig: Signal<string>,
    startDate: Signal<string>
}

export const BookingCalendar = component$(({ events, viewSig, startDate }: CalendarProps) => {
    const calendarRef = useSignal<HTMLElement>();
    const calendarInstance = useSignal<NoSerialize<Calendar> | null>(null);

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

    useVisibleTask$(() => {
        if (!calendarInstance.value && calendarRef.value) {
            const calendar = new Calendar(calendarRef.value, {
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, luxonPlugin],
                initialView: viewSig.value,
                titleFormat: 'LLLL d, yyyy',
                headerToolbar: {
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
                },
                events: events.map((b) => ({
                    id: b.id,
                    title: b.client_name,
                    start: b.datetime,
                    end: new Date(new Date(b.datetime).getTime() + b.duration * 60000).toISOString(),
                    color: b.color,
                })),
                nowIndicator: true,
                height: "auto",
                editable: true,
                selectable: true,
                selectMirror: true,
                dayMaxEvents: true,
                slotLabelFormat: {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false,

                },

                eventTimeFormat: {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false,
                },
                eventClick: function (info) {
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
                },

                select: function (info) {
                    console.log(info);
                    modalRef.value?.showModal();
                },
                datesSet: (info) => {
                    console.log("Current view:", info.view.type);
                    viewSig.value = info.view.type
                    startDate.value = info.startStr
                    console.log("Start date:", info.startStr)
                },
            });
            calendar.render();
            calendarInstance.value = noSerialize(calendar);
        }
    });

    useVisibleTask$(({track})=>{
        track(()=>events)
        const calendar = calendarInstance.value!;
        calendar.removeAllEvents();
        events.forEach((b) => {
            calendar.addEvent({
                id: b.id,
                title: b.technician_name + " | " + b.client_name + " | " + b.services_names.join(", "),
                start: b.datetime,
                end: new Date(new Date(b.datetime).getTime() + b.duration * 60000).toISOString(),
                color: b.color,

            });
        });

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
