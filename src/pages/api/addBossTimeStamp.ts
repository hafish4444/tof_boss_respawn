import { pusher } from "../../../lib/pusher";
import { NextApiResponse } from "next";
import { db } from "@vercel/postgres";
interface BossRespawn {
    bossId: string,
    channel: number,
    dieTime: string,
    respawnTime: string,
    isCheck: boolean,
    createdBy: string
}

// export const config = {
//     runtime: 'edge',
// };

export default async function handler(req: { body: BossRespawn }, res: NextApiResponse) {
    try {
        const param = req.body;
        const clientSQL = await db.connect()
        const { rowCount } = await clientSQL.sql`SELECT * FROM users where id = ${param.createdBy} limit 1`;
        if (rowCount === 0) {
            const uInsert = await clientSQL.sql`INSERT INTO public.users(id, username) VALUES (${param.createdBy}, '');`;
            if (uInsert.rowCount === 0) {
                res.status(400).json({ msg: "Can't Add user" });
            }
        }
        const boss_respawn = await clientSQL.sql`INSERT INTO boss_time_stamp
            ("bossId", channel, "dieTime", "respawnTime", "isCheck", "isDelete", "createdBy", "updatedBy") 
        VALUES (${param.bossId}, ${param.channel}, ${param.dieTime}, ${param.respawnTime}, ${param.isCheck}, false, ${param.createdBy}, null);`;

        if (boss_respawn.rowCount > 0) {
            await pusher.trigger("tof-boss-respawn-realtime", "boss-stamp-update", "Update time");
            res.status(200).json({ msg: "Stamp Success", bossId: param.bossId });
        } else {
            res.status(400).json({ msg: "Error Stamp Bosss" });
        }
    } catch (e: any) {
        console.error(e)
        res.status(400).json({ msg: "Error Add bosses", err: e });
    }
}