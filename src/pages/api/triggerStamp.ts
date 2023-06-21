import { NextApiRequest, NextApiResponse } from "next";
import { pusher } from "../../../lib/pusher";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await pusher.trigger("tof-boss-respawn-realtime", "boss-stamp-update", "Update time");
  res.json({ status: 200 });
}
