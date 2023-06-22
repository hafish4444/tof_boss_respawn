
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const feed = await prisma.users.findMany() 
    res.status(200).json(feed);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving users" });
  }
}