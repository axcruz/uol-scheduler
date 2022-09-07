import prisma from "../../../lib/prisma";

// DELETE /api/post/:id
// UPDATE /api/post/:id
export default async function handle(req, res) {
  const eventId = req.query.id;

  if (req.method === "DELETE") {
    const post = await prisma.event.delete({
      where: { id: eventId },
    });
    res.json(post);
  } else if (req.method === "POST") {
    const data = req.body;
    const post = await prisma.event.updateMany({
      where: {
        id: eventId,
      },
      data: data,
    });
    res.json(post);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}
