import type { NextApiRequest, NextApiResponse } from 'next';
import moment from "moment";
import clientPromise from "../../../../lib/mongodb";
import fs from 'fs';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");
    const bossTimeStamp = await db
      .collection("boss_time_stamp")
      .aggregate([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $lt: [
                    { $toDate: "$respawnTime" },
                    { $toDate: moment().subtract(75, 'minutes').toDate() }
                  ]
                }
              ]
            }
          }
        },
        {
          $limit: 500
        }
      ])
      .toArray();
    if (bossTimeStamp.length) {
      await db.collection("boss_time_stamp_temp").insertMany(bossTimeStamp);

      const documentIds = bossTimeStamp.map(doc => doc._id);
      await db.collection("boss_time_stamp").deleteMany({ _id: { $in: documentIds } });

    //   const bossTimeStampTemp = await db
    //   .collection("boss_time_stamp_temp")
    //   .aggregate([
    //     {
    //       $match: {
    //         $expr: {
    //           $and: [
    //             {
    //               $lt: [
    //                 { $toDate: "$respawnTime" },
    //                 { $toDate: moment().startOf('day').add(4, 'hour').subtract(1, 'days').toDate() }
    //               ]
    //             }
    //           ]
    //         }
    //       }
    //     },
    //     {
    //         $sort: {
    //             createdBy: -1
    //         }
    //     },
    //     { 
    //         $group: { 
    //             _id: '$createdBy', 
    //             count: { 
    //                 $sum: 1
    //             }
    //         }
    //     },
    //     {
    //         $project: { 
    //             userId: '$_id', 
    //             userName: '', 
    //             count: 1, 
    //             _id: 0 
    //         } 
    //     }
    //   ])
    //   .toArray();

    //   // Save the JSON data to a file
    //   fs.writeFile('data/userList.json', JSON.stringify(bossTimeStampTemp), (err) => {
    //       if (err) {
    //           console.error(err);
    //           res.status(500).json({ error: 'Unable to save JSON data' });
    //       } else {
    //           res.status(200).json({ message: 'JSON data saved successfully' });
    //       }
    //   });
    }

    (await clientPromise).close
    res.status(200).json({ msg: `Migrate ${bossTimeStamp.length} Success` });
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving boss_time_stamp" });
  }
}