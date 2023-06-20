import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from "mongodb"

export const config = {
    runtime: 'edge',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const client = await clientPromise;
        const db = client.db("tof_boss_stamp");
        const {_id, isCheck} = req.body
        
        const post = await db.collection("boss_time_stamp").updateOne(
            {
                _id: new ObjectId(_id)
            },
            {
                $set: {
                    isCheck: isCheck
                }
            }
        )

        res.json(post);
    } catch (e: any) {
        console.error(e)
        res.status(400).json({ msg: "Error Add bosses", err: e });
    }
}