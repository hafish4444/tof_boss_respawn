import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");

    const bosses = await db
      .collection("bosses")
      .find()
      .toArray();
      
    // Save the JSON data to a file
    fs.writeFile('data/bossList.json', JSON.stringify(bosses), (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Unable to save JSON data' });
        } else {
            res.status(200).json({ message: 'JSON data saved successfully' });
        }
    });

    res.status(200).json(bosses);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving bosses" });
  }
}