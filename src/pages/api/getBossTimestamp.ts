import moment from "moment";
import { NextApiResponse } from "next";
import { db } from "@vercel/postgres";
interface InputProps {
  bossList: [];
  userId: string;
  channel: number;
  limit: number;
  }

  // export const config = {
  //   runtime: 'edge',
  // };

export default async function handler(req: { body: InputProps }, res: NextApiResponse) {
  try {
    const client = await db.connect();
    let { bossList, userId, channel, limit } = req.body
    const bossIds = bossList.join()

    let _userId: string = ''
    let _channel: string = ''

    if (!userId) {
      _userId = "null"
    }
    if (!channel) {
      _channel = "null"
    }
    console.log('_userId', _userId)
    console.log('_channel', _channel)

    const bossTimeStamp = await client.sql`
      SELECT id, "bossId", channel, "dieTime", "respawnTime", "isCheck", "isDelete", "createdBy", "updatedBy" 
      FROM boss_time_stamp
      WHERE "isCheck" = false
        AND ("createdBy" = ${_userId} OR null is ${_userId})
        AND ("channel" = ${_channel} OR null is ${_channel})
        AND "respawnTime" > '${moment().subtract(15, 'minutes').toISOString()}'
      ORDER BY "dieTime"
      LIMIT ${limit && limit > 0 ? limit : 40};
    `;
    // AND bossId in (${bossIds})
    
    res.status(200).json(bossTimeStamp.rows);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: "Error retrieving boss_time_stamp", err: e });
  }
}