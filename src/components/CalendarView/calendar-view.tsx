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
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction/index.js";
import { DateTime } from "luxon";
import { fetchBookings } from "~/api/bookings/get";
import { useServices } from "~/routes/layout";
import type { CalendarStore, TechnicianResponse } from "~/types";
import { AestheticCalendar } from "./calendar-init";

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
        duration: event.end && event.start ? (event.end.getTime() - event.start.getTime()) / 60000 : 0,
      };
      modalRef.value?.showModal();
      info.jsEvent.preventDefault();
    });

    const SelectClick = $((info: DateSelectArg) => {
      console.log(info);
      modalRef.value?.showModal();
    });

    const eventResize = $((info: EventResizeDoneArg) => {
      console.log(info);
    });

    const eventDrop = $((info: EventDropArg) => {
      console.log(info);
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
            title: `${b.technician_name.charAt(0)} | ${b.client_name}\n ${b.services_names.join(", ")}`,
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
            <h3 class="font-bold text-lg mb-4">Edit Booking</h3>

            <div class="form-control mb-2">
              <label class="label" for="title">Title</label>
              <input
                type="text"
                class="input input-bordered"
                value={modal.event.title}
                onInput$={(e) => { modal.event.title = (e.target as HTMLInputElement).value }
                }
              />
            </div>

            <div class="form-control mb-2">
              <label class="label" for="start">Start Time</label>
              <input
                type="datetime-local"
                class="input input-bordered"
                value={
                  modal.event.start
                    ? DateTime.fromJSDate(modal.event.start).toFormat(
                      "yyyy-MM-dd'T'HH:mm",
                    )
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
                    (e.target as HTMLInputElement).value,
                  )
                }
                }
              />
            </div>

            <div class="modal-action">
              <form method="dialog">
                <button class="btn" type="submit">Cancel</button>
              </form>
              <button
                class="btn btn-primary"
                type="button"
                onClick$={() => {
                  console.log("Saving:", modal.event);
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
