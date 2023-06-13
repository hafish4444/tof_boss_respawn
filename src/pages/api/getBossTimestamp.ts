import moment from "moment";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { NextApiResponse } from "next";
interface InputProps {
  bossList: [];
  userId: string;
  channel: number;
  limit: number;
}

export default async function handler(req: { body: InputProps }, res: NextApiResponse) {
  try {
    const { bossList, userId, channel, limit } = req.body
    const bossIds = bossList?.map((id: string) => new ObjectId(id)) ?? []; // convert strings to ObjectIds
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");

    const bossTimeStamp = await db
      .collection("boss_time_stamp")
      .aggregate([
        {
          $match: {
            isCheck: false,
            createdBy: userId ? userId : { $ne: "" },
            channel: channel ? channel : { $ne: "" },
            $expr: {
              $and: [
                {
                  $gte: [
                    { $toDate: "$respawnTime" },
                    { $toDate: moment().subtract(15, 'minutes').toDate() }
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
            dieTime: 1
          }
        },
        {
          $limit: limit && limit > 0 ? limit : 40
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