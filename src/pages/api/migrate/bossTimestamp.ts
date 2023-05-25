import type { NextApiRequest, NextApiResponse } from 'next';
import moment from "moment";
import clientPromise from "../../../../lib/mongodb";

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
    }

    (await clientPromise).close
    res.status(200).json({ msg: `Migrate ${bossTimeStamp.length} Success` });
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving boss_time_stamp" });
  }
}