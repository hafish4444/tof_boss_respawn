import { ObjectId } from "mongodb"
import { pusher } from "../../../lib/pusher";
import clientPromise from '../../../lib/mongodb'
import { NextApiRequest, NextApiResponse } from "next";
interface BossRespawn {
    bossId: ObjectId
    channel: number
    dieTime: Date
    respawnTime: Date
    isCheck: boolean
    createdBy: string
}

// export const config = {
//     runtime: 'edge',
// };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const client = await clientPromise;
        const db = client.db("tof_boss_stamp");
        const user = await db.collection("users").findOneAndUpdate(
            { userId: req.body.createdBy },
            {
                $setOnInsert: { 
                    userId: req.body.createdBy,
                    userName: ""
                },
            },
            {
              upsert: true,
            }
        );
        const boss_respawn = await db.collection("boss_time_stamp").insertOne({
            ...req.body,
            bossId: new ObjectId(req.body.bossId)
        })
        await pusher.trigger("tof-boss-respawn-realtime", "boss-stamp-update", "Update time");
        res.json(boss_respawn);
    } catch (e: any) {
        console.error(e)
        res.status(400).json({ msg: "Error Add bosses", err: e });
    }
}