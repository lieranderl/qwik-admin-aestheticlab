import { Calendar, DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { EventResizeDoneArg } from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import luxonPlugin from "@fullcalendar/luxon3";
import { Signal } from "@builder.io/qwik";

export const AestheticCalendar = (
    calendarRef: HTMLElement,
    eventClick: ((arg: EventClickArg) => void),
    selectEvent: ((arg: DateSelectArg) => void),
    eventResize: ((arg: EventResizeDoneArg) => void),
    eventDrop: ((arg: EventDropArg) => void),
    viewSig: Signal<string>,
    startDate: Signal<Date>,
    endDate: Signal<Date>
) => new Calendar(calendarRef, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, luxonPlugin],
    initialView: viewSig.value,
    titleFormat: 'd LLLL yyyy',
    views: {
        week: {
            dayHeaderFormat: { day: 'numeric', weekday: 'short' }
        }
    },
    firstDay: 1,
    headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
    },
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
    eventClick: eventClick,
    select: selectEvent,
    eventResize: eventResize,
    eventDrop: eventDrop,
    datesSet: (info) => {
        startDate.value = info.view.activeStart
        endDate.value = info.view.activeEnd
      
    },
});