import moment from "moment";
import Pusher from "pusher-js";

import { useState, useEffect } from 'react';
import Head from 'next/head'
import Image from "next/image"
import ApiBoss from "@/helpers/api/boss"
import CardBoss from "../../components/cardBoss";

import BossRespawn from "../../types/bossRespawn"
interface PropsPreview {
  bossRespawnList: [BossRespawn]
}

export async function getServerSideProps() {
  try {
    const bossRespawn = await ApiBoss.getBossTimestamp()
    return {
      props: { bossRespawnList: JSON.parse(JSON.stringify(bossRespawn)) }
    }

  } catch(e) {
    console.error(e);
    return e
  }
}

export default function Home(props: PropsPreview) {
  const { bossRespawnList } = props
  const [time, setTime] = useState(new Date());

  const _bossTimeStampList: Array<BossRespawn> = []
  const [bossTimeStampList, setBossTimeStampList] = useState<Array<BossRespawn>>(_bossTimeStampList);
  const getBossTimeStampList = async () => {
    const bossRespawn = await ApiBoss.getBossTimestamp()
    return bossRespawn
  }

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_KEY as string, {
      cluster: process.env.PUSHER_APP_CLUSTER as string
    });

    if (typeof window !== "undefined") {
      setBossTimeStampList(bossRespawnList)
    }

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    const channel = pusher.subscribe("tof-boss-respawn-realtime"); 

    channel.bind("boss-stamp-update", async function (data: any) {
      setBossTimeStampList(await getBossTimeStampList())
    });
    return () => {
      clearInterval(interval);
      pusher.unsubscribe("tof-boss-respawn-realtime");
    }
  }, []);
  
  const displayBossTimeStampList = bossTimeStampList.filter(boss => moment().diff(boss.respawnTime, 'minutes') < 30 && !boss.isCheck)
  return (
    <>
      <Head>
        <title>TOF Boss Respawn Preview</title>
        <meta property="og:title" content="TOF Boss Respawn Preview" key="title" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-[#181826]">
        <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 md:px-8">
          <div className="grid  sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-3 min-h-[341px]">
            { 
              displayBossTimeStampList.length > 0 ? 
                displayBossTimeStampList.map((boss, index) => (
                  <CardBoss disabledCheckBoss={true} key={index} boss={boss} handleCheckBoss={() => ""} notify={() => ""}/>
                ))
              : <div className="self-center text-white text-xl col-span-12 text-center">
                  <Image
                    src={"/nya.png"}
                    alt={`nya`}
                    width={180}
                    height={40}
                    className="m-auto mb-3"
                  />
                </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}
