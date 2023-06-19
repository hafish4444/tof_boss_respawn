import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let bosses :[] = []
    // Read the JSON data from the file
    fs.readFile('data/bossList.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Unable to Get Bosses' });
      } else {
        bosses = JSON.parse(data);
        res.status(200).json(bosses);
      }
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving bosses" });
  }
}