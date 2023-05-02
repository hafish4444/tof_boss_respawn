import moment from "moment";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req :any, res: any) {
  try {
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");

    const bossTimeStamp = await db
      .collection("boss_time_stamp")
      .aggregate([
        {
          $match: {
            isCheck: false,
            $expr: {
              $gte: [
                { $toDate: "$respawnTime" },
                { $toDate: moment().subtract(30, 'minutes').toDate() }
              ]
            }
          }
        },
        {
          $sort: {
            dieTime: 1
          }
        },
        {
          $limit: 40
        },
        {
          $lookup: {
            from: "bosses",
            localField: "bossId",
            foreignField: "_id",
            as: "boss"
          }
        },
        {
          $unwind: '$boss'
        }
      ])
      .toArray();
    res.status(200).json(bossTimeStamp);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving boss_time_stamp" });
  }
}