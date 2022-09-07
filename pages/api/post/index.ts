import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

// POST /api/post
export default async function handle(req, res) {
  const { title, start, startStr, end, endStr, allDay, desc } = req.body;

  const session = await getSession({ req });
  const result = await prisma.event.create({
    data: {
      title: title,
      owner: { connect: { email: session?.user.email } },
      start: start,
      startStr: startStr,
      end: end,
      endStr: endStr,
      allDay: allDay,
      desc: desc,
    },
  });
  res.json(result);
}
