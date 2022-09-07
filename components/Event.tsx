import React from "react";
import Router from "next/router";
import ReactMarkdown from "react-markdown";
import { EventApi } from '@fullcalendar/react'

export type EventProps = EventApi & {
  owner: {
    name: string;
    email: string;
  } | null;
  desc: string;
  published: boolean;
};

const Event: React.FC<{ event: EventProps }> = ({ event }) => {
  const authorName = event.owner ? event.owner.name : "Unknown author";

  return (
    <div onClick={() => Router.push("/e/[id]", `/e/${event.id}`)}>
      <h2>{event.title}</h2>
      <small>By {authorName}</small>
      <div>Starts: {event.startStr}</div>
      <div>Ends: {event.endStr}</div>
      <ReactMarkdown children={event.desc} />
    </div>
  );
};

export default Event;
