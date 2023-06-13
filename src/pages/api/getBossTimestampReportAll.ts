import moment from "moment";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { NextApiResponse } from "next";
interface InputProps {
  bossList: [];
  userId: string
}

export default async function handler(req: { body: InputProps }, res: NextApiResponse) {
  try {
    const { bossList, userId } = req.body
    const bossIds = bossList.map((id: string) => new ObjectId(id)); // convert strings to ObjectIds
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");
    console.log(moment().startOf('day').add(4, 'hour').format("D HH:mm:ss"))
    const bossTimeStamp = await db
      .collection("boss_time_stamp_temp")
      .aggregate([
        {
          $match: {
            createdBy: userId ? userId : { $ne: "" },
            $expr: {
              $and: [
                {
                  $lt: [
                    { $toDate: "$respawnTime" },
                    { $toDate: moment().startOf('day').add(4, 'hour').subtract(1, 'days').toDate() }
                  ]
                },
                bossIds.length 
                  ? {
                    $in: [
                      '$bossId',
                      bossIds
                    ]
                  }
                  : {}
              ]
            }
          }
        },
        {
          $sort: {
            dieTime: -1
          }
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