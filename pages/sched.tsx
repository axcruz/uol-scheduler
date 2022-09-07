import React from "react";
import { GetServerSideProps } from "next";
import { useSession, getSession } from "next-auth/react";
import Layout from "../components/Layout";
import Event, { EventProps } from "../components/Event";
import prisma from "../lib/prisma";
import AccessDenied from "../components/AccessDenied";
import Loading from "../components/Loading";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return { props: { events: [] } };
  }
  const ev = await prisma.event.findMany({
    where: {
      owner: { email: session.user.email },
    },
    include: {
      owner: {
        select: { name: true },
      },
    },
  });
  const events = JSON.parse(JSON.stringify(ev));
  return {
    props: { events },
  };
};

type Props = {
  events: EventProps[];
};

export default function Sched(props: Props) {
  const { data: session, status } = useSession();

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

  // Render page content
  return (
    <Layout>
            <div className="m-6">
        <h1 className="text-lg font-bold">See Your Events</h1>
        <p className="p-1">
          View a list of your created events.
        </p>
      </div>
      <div className="m-5">
        <div>
          {props.events.map((event) => (
            <div
              key={event.id}
              className="m-2 border-2 rounded-md cursor-pointer hover:drop-shadow-2xl"
            >
              <div className="m-2">
                <Event event={event} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
