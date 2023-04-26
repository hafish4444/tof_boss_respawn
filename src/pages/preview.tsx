import moment from "moment"

import { useState, useEffect } from 'react';
import Image from "next/image"

import Input from "../../components/input";
import Select from "../../components/select";
import { v4 as uuidv4 } from 'uuid';
import CardBoss from "../../components/cardBoss";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head'

interface Boss {
  bossId: string,
  name: string,
  imageUrl: string
}
interface BossRespawn extends Boss {
  bossRespawnId: string,
  channel: number,
  dieTime: Date,
  respawnTime: Date,
  isCheck: boolean
}
interface optionProps {
  label: string;
  value: string;
}

export default function Home() {
  const boosList: Array<Boss> = [
    {
      bossId: "ROBRAG",
      name: "Robrag",
      imageUrl: "/robrag.png"
    },
    {
      bossId: "BARBAROSSA",
      name: "Barbarossa",
      imageUrl: "/barbarossa.png"
    },
    {
      bossId: "SOBEK",
      name: "Sobek",
      imageUrl: "/sobek.png"
    },
    {
      bossId: "Lucia",
      name: "Lucia",
      imageUrl: "/lucia.png"
    },
    {
      bossId: "Apophis",
      name: "Apophis",
      imageUrl: "/apophis.png"
    },
    {
      bossId: "Frostbot",
      name: "Frostbot",
      imageUrl: "/frostbot.png"
    },
    {
      bossId: "Frog",
      name: "Devourer (กบ)",
      imageUrl: "/frog.png"
    },
    {
      bossId: "FrostFiredragon",
      name: "Frostfire Dragon",
      imageUrl: "/frostfiredragon.png"
    }
  ];

  const bossOptions: Array<optionProps> = boosList.map((boss) => {
    return {
      label: boss.name,
      value: boss.bossId
    }
  })

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const _bossTimeStampList: Array<BossRespawn> = []
  const [bossTimeStampList, setBossTimeStampList] = useState<Array<BossRespawn>>(_bossTimeStampList);


  useEffect(() => {
    if (typeof window !== "undefined") {
      setBossTimeStampList(
        JSON.parse(window.localStorage.getItem('bossTimeStampList') ?? "[]")
      )
    }
  }, [])
  
  const displayBossTimeStampList = bossTimeStampList.filter(boss => moment().diff(boss.respawnTime, 'minutes') < 30 && !boss.isCheck).slice(0, 40).sort((boss1, boss2) => moment(boss1.dieTime).diff(moment(boss2.dieTime)))
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
