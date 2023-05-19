import { NextApiRequest, NextApiResponse } from "next";
import { pusher } from "../../../lib/pusher";

// presence channel handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message} = req.query;
  // trigger a new post event via pusher
  await pusher.trigger("tof-boss-respawn-realtime", "boss-stamp-update", {
    message
  });

  res.json({ status: 200 });
}
