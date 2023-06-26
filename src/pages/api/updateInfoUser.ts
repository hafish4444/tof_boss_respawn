import { ObjectId } from "mongodb"
import { pusher } from "../../../lib/pusher";
import clientPromise from '../../../lib/mongodb'
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const client = await clientPromise;
        const db = client.db("tof_boss_stamp");
        const param = req.body
        const user = await db.collection("users").updateOne(
            { userId: param.userId },
            {
                $set: {
                    "userId": param.userId,
                    "userName": param.userName,
                    "disabledClipboard": param.disabledClipboard,
                    "textCall1": param.textCall1,
                    "textCall2": param.textCall2,
                    "textFreeChest1": param.textFreeChest1,
                    "textFreeChest2": param.textFreeChest2
                },
            },
            {
              upsert: true,
            }
        );
        res.json(user);
    } catch (e: any) {
        res.status(400).json({ msg: "Error Add/Update Users", err: e });
    }
}