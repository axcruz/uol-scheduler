import React, { Fragment, useState } from "react";
import Layout from "../components/Layout";
import { useSession } from "next-auth/react";
import { Transition, Dialog } from "@headlessui/react";
import AccessDenied from "../components/AccessDenied";
import FullCalendar, {EventApi, DateSelectArg, EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { createEventId } from "../lib/event-utils";
import Loading from "../components/Loading";

export default function Home() {

  const { data: session, status } = useSession();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [allDay, setAllDay] = useState(false);

  const [showNewEvtModal, setNewEvtModal] = useState(false);
  const [selectInfo, setSelectInfo] = useState({} as DateSelectArg);
  const [showUpdateEvtModal, setUpdateEvtModal] = useState(false);
  const [clickInfo, setClickInfo] = useState({} as EventClickArg);

  function closeModalNewEvt() {
    setNewEvtModal(false);
  }

  function openModalNewEvt() {
    setNewEvtModal(true);
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setStart(selectInfo.startStr);
    setEnd(selectInfo.endStr);
    setAllDay(selectInfo.allDay);
    setSelectInfo(selectInfo);
    openModalNewEvt();
  };

  function handleSubmitNewEvt() {
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
    calendarApi.addEvent({
      id: createEventId(),
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      extendedProps: { desc },
    });
  }

  const handleEventAdd = (e) => {
    submitEvent(e.event);
  };

  const submitEvent = async (ev: EventApi) => {
    try {
      const data = {
        title: ev.title,
        start: ev.start,
        startStr: ev.startStr,
        end: ev.end,
        endStr: ev.endStr,
        allDay: ev.allDay,
        desc: ev.extendedProps.desc,
      };
      await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(error);
    }
  };

  function closeModalUpdateEvt() {
    setUpdateEvtModal(false);
  }

  function openModalUpdateEvt() {
    setUpdateEvtModal(true);
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    setTitle(clickInfo.event.title);
    setStart(clickInfo.event.startStr);
    setEnd(clickInfo.event.endStr);
    setAllDay(clickInfo.event.allDay);
    setDesc(clickInfo.event.extendedProps.desc);
    setClickInfo(clickInfo);
    openModalUpdateEvt();
  };

  function handleSubmitUpdateEvt() {
    let clickedEvt = clickInfo.event;
    clickedEvt.setProp("title", title);
    clickedEvt.setStart(startDate);
    clickedEvt.setEnd(endDate);
    clickedEvt.setExtendedProp("desc", desc);
    let updatedEvt = clickInfo.view.calendar.getEventById(clickedEvt.id);
    updateEvent(updatedEvt);
  }

  const updateEvent = async (ev: EventApi) => {
    try {
      const data = {
        title: title,
        start: ev.start,
        startStr: ev.startStr,
        end: ev.end,
        endStr: ev.endStr,
        allDay: ev.allDay,
        desc: ev.extendedProps.desc,
      };
      await fetch(`/api/post/${ev.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => response.statusText)
        .then((data) => {
          console.log(data);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvt = (e) => {
    if (
      confirm(
        `Are you sure you want to delete event: '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
      closeModalUpdateEvt();
    }
  };

  const handleEventRemove = (e) => {
    deleteEvent(clickInfo.event._def.publicId);
  };

  async function deleteEvent(id: string) {
    await fetch(`/api/post/${id}`, {
      method: "DELETE",
    });
  }

  // If no session exists, display access denied message
  if (!session && status != "loading") {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  // If loading, display loading spinner
  if (status === "loading") {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="m-6">
        <h1 className="text-lg font-bold">Welcome to the Team Calendar!</h1>
        <p className="p-1">
          Schedule an event for the team by clicking on or dragging over open
          space on the calendar.
        </p>
        <p className="p-1">You can edit or delete event by clicking on it.</p>
      </div>

      <div className="p-5 m-10">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          headerToolbar={{
            left: "today prev,next",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          initialView="timeGridWeek"
          footerToolbar={{
            left: "",
            center: "",
            right: "",
          }}
          aspectRatio={1}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={"/api/get"}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventAdd={handleEventAdd}
          eventRemove={handleEventRemove}
        />
      </div>

      <Transition appear show={showNewEvtModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModalNewEvt}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Schedule An Event
                  </Dialog.Title>

                  <Dialog.Description>
                    <div className="my-2 text-sm text-gray-500">
                      Confirm your event details here.
                    </div>
                  </Dialog.Description>

                  <div className="my-6">
                    <form>
                      <div className="grid gap-6 my-6 md:grid-cols-1">
                        <div>
                          <label
                            htmlFor="event_start"
                            className="mb-2 text-sm font-medium text-gray-900"
                          >
                            Start Time:
                          </label>
                          <output
                            id="event_start"
                            className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          >
                            {allDay
                              ? new Date(startDate).toDateString()
                              : new Date(startDate).toString()}
                          </output>
                        </div>
                        <div>
                          <label
                            htmlFor="event_start"
                            className="mb-2 text-sm font-medium text-gray-900"
                          >
                            End Time:
                          </label>
                          <output
                            id="event_end"
                            className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          >
                            {allDay
                              ? new Date(endDate).toDateString()
                              : new Date(endDate).toString()}
                          </output>
                        </div>

                        <div>
                          <label
                            htmlFor="event_title"
                            className="block mb-2 text-sm font-medium text-gray-900"
                          >
                            Event Title
                          </label>
                          <input
                            type="text"
                            id="event_title"
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="My Event"
                            required={true}
                            value={title}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="event_desc"
                            className="block mb-2 text-sm font-medium text-gray-900"
                          >
                            Event Description
                          </label>
                          <textarea
                            rows={4}
                            id="event_desc"
                            onChange={(e) => setDesc(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Write a description..."
                            required={false}
                            value={desc}
                          />
                        </div>

                        <div className="flex justify-center">
                          <button
                            type="reset"
                            onClick={closeModalNewEvt}
                            className="mx-2 text-black bg-[#eeeeee] hover:bg-blue-800 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            onClick={handleSubmitNewEvt}
                            disabled={!title || !startDate || !endDate}
                            className="mx-2 text-white bg-[#006082] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:bg-[#eeeeee] disabled:text-gray-500"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={showUpdateEvtModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={closeModalUpdateEvt}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Modify Event
                  </Dialog.Title>

                  <Dialog.Description>
                    <div className="my-2 text-sm text-gray-500">
                      Modify or delete an event.
                    </div>
                  </Dialog.Description>

                  <div className="my-6">
                    <form>
                      <div>
                        <label
                          htmlFor="event_title"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Event Title
                        </label>
                        <input
                          type="text"
                          id="event_title"
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          placeholder="My Event"
                          required={true}
                          value={title}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="event_start"
                          className="mb-2 text-sm font-medium text-gray-900"
                        >
                          Start Time:
                        </label>
                        <input
                          type="datetime-local"
                          id="event_start"
                          onChange={(e) => setStart(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5"
                          value={startDate}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="event_end"
                          className="mb-2 text-sm font-medium text-gray-900"
                        >
                          End Time:
                        </label>
                        <input
                          type="datetime-local"
                          id="event_end"
                          onChange={(e) => setEnd(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5"
                          value={endDate}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="event_desc"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Event Description
                        </label>
                        <textarea
                          rows={4}
                          id="event_desc"
                          onChange={(e) => setDesc(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          placeholder="Write a description..."
                          required={false}
                          value={desc}
                        />
                      </div>

                      <div className="grid gap-6 my-6 md:grid-cols-1">
                        <div className="flex justify-center">
                          <button
                            type="reset"
                            onClick={closeModalUpdateEvt}
                            className="mx-2 text-black bg-[#eeeeee] hover:bg-blue-800 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            onClick={handleSubmitUpdateEvt}
                            disabled={!title || !startDate || !endDate}
                            className="mx-2 text-white bg-[#006082] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:bg-[#eeeeee] disabled:text-gray-500"
                          >
                            Submit
                          </button>
                          <button
                            type="reset"
                            onClick={handleDeleteEvt}
                            className="mx-2 text-white bg-[#a7251a] hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:bg-[#eeeeee] disabled:text-gray-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Layout>
  );
}
