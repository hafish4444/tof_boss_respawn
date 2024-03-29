import clientPromise from "../../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");

    const movies = await db
      .collection("bosses")
      .find()
      .toArray();
    res.status(200).json(movies);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving bosses" });
  }
}