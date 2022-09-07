import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

// GET /api/get
export default async function handle(req, res) {
  const session = await getSession({ req });
  const startDate = req.query?.start;
  const endDate = req.query?.end;
  const eventId = req.query?.id;

  if (!session) {
    res.statusCode = 403;
    return { props: { events: [] } };
  }

  if (req.method === "GET") {
    if (startDate && endDate) {
      const events = await prisma.event.findMany({
        where: {
          start: {
            gte: new Date(startDate),
            lt: new Date(endDate),
          },
        },
      });
      res.json(JSON.parse(JSON.stringify(events)));
    } else if (eventId) {
      const events = await prisma.event.findMany({
        where: { id: eventId },
      });
      res.json(JSON.parse(JSON.stringify(events)));
    } else {
      const events = await prisma.event.findMany();
      res.json(JSON.parse(JSON.stringify(events)));
    }
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}
