import React from "react";
import { GetServerSideProps } from "next";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout";
import { useSession } from "next-auth/react";
import prisma from "../../lib/prisma";
import Router from "next/router";
import AccessDenied from "../../components/AccessDenied";
import Loading from "../../components/Loading";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const event = await prisma.event.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      owner: {
        select: { name: true },
      },
    },
  });
  const ev = JSON.parse(JSON.stringify(event));
  return {
    props: ev,
  };
};

async function deletePost(id: string): Promise<void> {
  await fetch(`/api/post/${id}`, {
    method: "DELETE",
  });
  Router.push("/");
}

export default function EventInfo(props) {
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

  return (
    <Layout>
      <div>
        <h2>{props.title}</h2>
        <p>By {props?.owner?.name || "Unknown author"}</p>
        <ReactMarkdown children={props.desc} />
        <button onClick={() => deletePost(props.id)}>Delete</button>
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
}
