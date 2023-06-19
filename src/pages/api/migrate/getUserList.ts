import moment from "moment";
import clientPromise from "../../../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");
    // console.log(moment().startOf('day').add(4, 'hour').format("D HH:mm:ss"))
    const bossTimeStamp = await db
      .collection("boss_time_stamp_temp")
      .aggregate([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $lt: [
                    { $toDate: "$respawnTime" },
                    { $toDate: moment().startOf('day').add(4, 'hour').subtract(1, 'days').toDate() }
                  ]
                }
              ]
            }
          }
        },
        {
            $sort: {
                createdBy: -1
            }
        },
        { 
            $group: { 
                _id: '$createdBy', 
                count: { 
                    $sum: 1
                }
            }
        },
        {
            $project: { 
                userId: '$_id', 
                userName: '', 
                count: 1, 
                _id: 0 
            } 
        }
      ])
      .toArray();

    // Save the JSON data to a file
    fs.writeFile('data/userList.json', JSON.stringify(bossTimeStamp), (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Unable to save JSON data' });
        } else {
            res.status(200).json({ message: 'JSON data saved successfully' });
        }
    });
      
    res.status(200).json(bossTimeStamp);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving boss_time_stamp" });
  }
}