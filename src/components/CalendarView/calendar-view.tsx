import {
  $,
  type Signal,
  component$,
  noSerialize,
  useOnDocument,
  useSignal,
  useStore,
  useTask$,
  type NoSerialize,
} from "@builder.io/qwik";
import type {
  Calendar,
  CalendarApi,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction/index.js";
import { DateTime } from "luxon";
import { fetchBookings } from "~/api/bookings/get";
import type { CalendarStore, TechnicianResponse } from "~/types";
import { AestheticCalendar } from "./calendar-init";
import { useServices } from "~/routes/admin/layout";

export type CalendarProps = {
  selectedTechnicians: Signal<TechnicianResponse[]>;
  calendarStore: CalendarStore;
};

export const BookingCalendar = component$(
  ({ selectedTechnicians, calendarStore }: CalendarProps) => {
    const calendarRef = useSignal<HTMLElement>();
    const calendarInstance = useSignal<NoSerialize<Calendar> | null>(null);
    const services = useServices();

    const modalRef = useSignal<HTMLDialogElement>();
    const modal = useStore({
      event: {
        id: "",
        title: "",
        start: null as Date | null,
        end: null as Date | null,
        duration: 0,
      },
      calendar: null as CalendarApi | null,
    });

    const EventClick = $((info: EventClickArg) => {
      const event = info.event;
      modal.event = {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        duration: event.end && event.start ?
          (event.end.getTime() - event.start.getTime()) / 60000 : 0
      };
      modal.calendar = info.view.calendar; // Store calendar reference
      modalRef.value?.showModal();
      info.jsEvent.preventDefault();
    });

    const SelectClick = $((info: DateSelectArg) => {
      console.log(info);
      modal.event = {
        id: "",
        title: "",
        start: info.start,
        end: info.end,
        duration: info.end && info.start ? (info.end.getTime() - info.start.getTime()) / 60000 : 0,
      };
      modal.calendar = info.view.calendar; // Store calendar reference
      modalRef.value?.showModal();
    });

    const eventResize = $((info: EventResizeDoneArg) => {
      console.log(info);
    });

    const eventDrop = $((info: EventDropArg) => {
      console.log(info);
    });

    const eventMouseEnter = $((info: EventClickArg) => {
      if (info.view.type === "timeGridWeek" || info.view.type === "timeGridDay" || info.view.type === "listWeek") return;
      info.jsEvent.preventDefault();

      // 1. Create tooltip
      const tooltip = document.createElement("div");
      tooltip.className = `
            fixed z-[9999] px-3 py-2 text-sm
            bg-gray-800 text-white rounded-lg shadow-lg
            pointer-events-none
            transform -translate-x-1/2 -translate-y-full
            mt-[-8px]  /* 8px gap above element */
        `;
      tooltip.textContent = info.event.title;

      // 2. Position it above the element
      const rect = info.el.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top + window.scrollY}px`;

      // 3. Add arrow
      const arrow = document.createElement("div");
      arrow.className = `
            absolute left-1/2 top-full
            w-2 h-2 bg-gray-800 rotate-45
            transform -translate-x-1/2 -translate-y-1/2
        `;
      tooltip.appendChild(arrow);

      // 4. Show tooltip
      document.body.appendChild(tooltip);

      // 5. Remove on mouse leave/click
      const removeTooltip = () => tooltip.remove();
      info.el.addEventListener("mouseleave", removeTooltip);
      info.el.addEventListener("click", removeTooltip);
    });

    useOnDocument(
      "DOMContentLoaded",
      $(() => {
        if (!calendarInstance.value && calendarRef.value) {
          const calendar = AestheticCalendar(
            calendarRef.value,
            EventClick,
            SelectClick,
            eventResize,
            eventDrop,
            eventMouseEnter,
            calendarStore,
          );
          calendar.render();
          calendarInstance.value = noSerialize(calendar);
        }
      }),
    );

    useTask$(async ({ track }) => {
      track(() => calendarStore.activeStart || calendarStore.activeEnd);
      track(() => selectedTechnicians.value);
      if (!calendarInstance.value) return;

      const calendar = calendarInstance.value;
      calendar.removeAllEvents();
      calendarStore.events = [];

      if (selectedTechnicians.value) {
        const bookings = selectedTechnicians.value.map(async (technician) => {
          return await fetchBookings(
            technician.id,
            technician.name,
            technician.color,
            services.value.data || [],
            calendarStore.activeStart.toISOString(),
            calendarStore.activeEnd.toISOString(),
          );
        });

        const BookingResponse = await Promise.all(bookings);
        calendarStore.events = BookingResponse.flatMap((b) => b.data || []);

        for (const b of calendarStore.events) {
          calendar.addEvent({
            id: b.id,
            title: `${b.technician_name.charAt(0)} | ${b.client_name} | ${b.services_names.join(", ")}`,
            start: b.datetime,
            end: new Date(
              new Date(b.datetime).getTime() + b.duration * 60000,
            ).toISOString(),
            color: b.color,
            textColor: "black",
            extendedProps: {
              tech_id: b.technician_id,
            },
          });
        }
      } else {
        calendar.removeAllEvents();
      }
    });

    return (
      <>
        <div ref={calendarRef} class="rounded-box overflow-hidden" />

        <dialog ref={modalRef} id="editModal" class="modal">
          <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">
              {modal.event.id ? 'Edit Booking' : 'New Booking'}
            </h3>

            <div class="form-control mb-2">
              <label class="label" for="title">Title</label>
              <input
                type="text"
                class="input input-bordered"
                value={modal.event.title}
                onInput$={(e) => {
                  modal.event.title = (e.target as HTMLInputElement).value
                }}
              />
            </div>

            <div class="form-control mb-2">
              <label class="label" for="start">Start Time</label>
              <input
                type="datetime-local"
                class="input input-bordered"
                value={
                  modal.event.start
                    ? DateTime.fromJSDate(modal.event.start).toFormat("yyyy-MM-dd'T'HH:mm")
                    : ""
                }
                onInput$={(e) => {
                  const val = (e.target as HTMLInputElement).value;
                  modal.event.start = val ? new Date(val) : null;
                }}
              />
            </div>

            <div class="form-control mb-4">
              <label class="label" for="duration">Duration (minutes)</label>
              <input
                type="number"
                class="input input-bordered"
                value={modal.event.duration}
                onInput$={(e) => {
                  modal.event.duration = Number.parseInt(
                    (e.target as HTMLInputElement).value
                  );
                }}
              />
            </div>

            <div class="modal-action">
              <form method="dialog">
                <button class="btn" type="submit">Cancel</button>
              </form>

              {/* Delete button */}
              {modal.event.id && (
                <button
                  class="btn btn-error"
                  type="button"
                  onClick$={() => {
                    console.log("Deleting:", modal.event.id);
                    const existingEvent = modal.calendar?.getEventById(modal.event.id);
                    if (existingEvent) {
                      existingEvent.remove();
                    }
                    modalRef.value?.close();
                  }}
                >
                  Delete
                </button>
              )}

              <button
                class="btn btn-primary"
                type="button"
                onClick$={() => {
                  console.log("Saving:", modal.event);

                  // Validate required fields
                  if (!modal.event.title || !modal.event.start) {
                    alert("Please fill in all required fields");
                    return;
                  }

                  // Calculate end time
                  const end = modal.event.start && modal.event.duration
                    ? new Date(modal.event.start.getTime() + modal.event.duration * 60000)
                    : modal.event.end;

                  // Prepare event data with proper types
                  const eventData = {
                    id: modal.event.id || crypto.randomUUID(),
                    title: modal.event.title,
                    start: modal.event.start,
                    end: end || undefined // Convert null to undefined
                  };

                  // Update or add event
                  if (modal.event.id && modal.calendar) {
                    const existingEvent = modal.calendar.getEventById(modal.event.id);
                    if (existingEvent) {
                      existingEvent.setProp('title', eventData.title);
                      existingEvent.setDates(eventData.start, eventData.end || null);
                    }
                  } else if (modal.calendar) {
                    modal.calendar.addEvent(eventData);
                  }

                  modalRef.value?.close();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </dialog>
      </>
    );
  },
);
