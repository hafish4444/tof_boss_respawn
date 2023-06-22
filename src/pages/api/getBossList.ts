import { db } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await db.connect();
    const { rows } = await client.sql`SELECT *, name_th as name from bosses order by city, ord`;
    res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving bosses" });
  }
}