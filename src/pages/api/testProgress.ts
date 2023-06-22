import moment from "moment";
import { NextApiResponse } from "next";
import prisma from '../../../lib/prisma';
interface InputProps {
  bossList: [];
  userId: string | undefined;
  channel: number | undefined;
  limit: number;
  }

export default async function handler(req: { body: InputProps }, res: NextApiResponse) {
  try {
    let { bossList, userId, channel, limit } = req.body

    const bossIds = bossList.length ? bossList : undefined

    userId = userId || undefined;
    channel = channel || undefined;

    const bossTimeStamp = await prisma.boss_time_stamp.findMany({
      where: {
        isCheck: false,
        createdBy: userId,
        channel: channel,
        respawnTime: {
          gt: moment().subtract(15, 'minutes').toISOString(),
        },
        bosses: {
          id: {
            in: bossIds,
          },
        }
      },
      orderBy: {
        dieTime: 'asc',
      },
      take: limit && limit > 0 ? limit : 40,
      include: {
        bosses: true,
      }
    });
    
    res.status(200).json(bossTimeStamp);
  } catch (e) {
    console.log(e)
    res.status(400).json({ msg: "Error retrieving boss_time_stamp", err: e });
  }
}