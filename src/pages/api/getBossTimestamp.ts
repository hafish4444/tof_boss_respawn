import clientPromise from "../../../lib/mongodb";

export default async function handler(req :any, res: any) {
  try {
    const client = await clientPromise;
    const db = client.db("tof_boss_stamp");

    const bossTimeStamp = await db
      .collection("boss_time_stamp")
      .aggregate([
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