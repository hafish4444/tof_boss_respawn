import moment from "moment";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { NextApiResponse } from "next";
interface InputProps {
  bossList: []
  userList: []
}

export default async function handler(req: { body: InputProps }, res: NextApiResponse) {
  try {
    const { bossList, userList } = req.body
    const bossIds = bossList.map((id: string) => new ObjectId(id)); // convert strings to ObjectIds
    const userIds = userList
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");
    // console.log(moment().startOf('day').add(4, 'hour').format("D HH:mm:ss"))
    const bossTimeStamp = await db
      .collection("boss_time_stamp_temp")
      .aggregate([
        {
          $match: {
            channel: { 
              $ne: 0
            },
            $expr: {
              $and: [
                {
                  $lt: [
                    { $toDate: "$respawnTime" },
                    { $toDate: moment().startOf('day').add(4, 'hour').toDate() }
                  ]
                },
                bossIds.length 
                  ? {
                    $in: [
                      '$bossId',
                      bossIds
                    ]
                  }
                  : {},
                userIds.length 
                  ? {
                    $in: [
                      '$createdBy',
                      userIds
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
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "userId",
            as: "user"
          }
        },
        {
          $unwind: '$user'
        }
      ])
      .toArray();
    res.status(200).json(bossTimeStamp);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving boss_time_stamp" });
  }
}