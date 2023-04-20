import moment from "moment"
import Image from "next/image"

import { useState, useEffect } from 'react';
import Input from "../../components/input";
import Select from "../../components/select";
import { v4 as uuidv4 } from 'uuid';

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

export default function Home() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [bossSelected, setBossSelected] = useState("ROBRAG");
  const handleChangeBoss = (e: any) => {
    const value = e.target.value
    setBossSelected(value);
  };

  const handleCheckBoss = (boss: BossRespawn, isFind: Boolean) => {
    let _bossTimeStampList = JSON.parse(JSON.stringify(bossTimeStampList))
    const bossIndex = _bossTimeStampList.findIndex((_boss: BossRespawn) => _boss.bossRespawnId === boss.bossRespawnId)
    boss.isCheck = true
    _bossTimeStampList[bossIndex] = boss
    if (isFind) {
      const newBoss: BossRespawn = {
        bossRespawnId: uuidv4(),
        name: boss?.name ?? "",
        bossId: boss?.bossId ?? "",
        imageUrl: boss?.imageUrl ?? "",
        channel: boss?.channel,
        dieTime: new Date(),
        respawnTime: new Date(moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')),
        isCheck: false
      }
      _bossTimeStampList = [
        ..._bossTimeStampList,
        newBoss
      ]
    }
    setBossTimeStampList(_bossTimeStampList)
    window.localStorage.setItem('bossTimeStampList', JSON.stringify(_bossTimeStampList))
  }

  const [channelSelected, setChannelSelected] = useState<number>(0);
  const handleChangeChannel = (e: any) => {
    const value = parseInt(e.target.value)
    setChannelSelected(value);
  };

  const _bossTimeStampList: Array<BossRespawn> = []
  const [bossTimeStampList, setBossTimeStampList] = useState<Array<BossRespawn>>(_bossTimeStampList);

  const stampBossRespawn = async () => {
    const boss = boosList.find(boss => boss.bossId === bossSelected)
    const newBoss: BossRespawn = {
      bossRespawnId: uuidv4(),
      name: boss?.name ?? "",
      bossId: boss?.bossId ?? "",
      imageUrl: boss?.imageUrl ?? "",
      channel: channelSelected,
      dieTime: new Date(),
      respawnTime: new Date(moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')),
      isCheck: false
    }
    const newBossList = [
      ...bossTimeStampList,
      newBoss
    ]
    setBossTimeStampList(newBossList)
    window.localStorage.setItem('bossTimeStampList', JSON.stringify(newBossList))
  }

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
      imageUrl: "/sobeek.png"
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
      name: "Frog",
      imageUrl: "/frog.png"
    },
    {
      bossId: "FrostFiredragon",
      name: "Dragon",
      imageUrl: "/frostfiredragon.png"
    }
  ];


  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(window.localStorage.getItem('bossTimeStampList'))
      setBossTimeStampList(
        JSON.parse(window.localStorage.getItem('bossTimeStampList') ?? "[]")
      )
    }
  }, [])

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 md:px-8">
        <div className="grid  sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-3">
          {bossTimeStampList.filter(boss => moment().diff(boss.respawnTime, 'minutes') < 30 && !boss.isCheck).slice(0, 40).sort((boss1, boss2) => moment(boss1.dieTime).diff(moment(boss2.dieTime))).map((boss, index) => (
            <div className="bg-slate-700 rounded-xl shadow-lg dark:shadow-none  text-white p-4" key={index}>
              <div className="flex justify-between items-center mb-2">
                <div className="text-[24px] font-bold">{boss.name} | {boss.channel}</div>
                <div><Image src={boss.imageUrl} alt={`Boss ${boss.name} Image`} width={150} height={100} /></div>
              </div>
              <div className="text-[20px]">
                { Math.floor(moment(time).diff(boss.respawnTime, 'second') / 60) }
              </div>
              <div className="flex justify-between items-center">
                <div className="text-[22px]">
                  {moment(boss.respawnTime).format("hh:mm:ss")}
                </div>
                <div>
                  <button className="rounded-full bg-black p-2 text-center w-[34px] h-[34px] mr-1 text-sm" onClick={() => handleCheckBoss(boss, true)}>✓</button>
                  <button className="rounded-full bg-black p-2 text-center w-[34px] h-[34px] text-sm" onClick={() => handleCheckBoss(boss, false)}>✗</button>
                </div>
              </div>

            </div>
          ))}
        </div>
        <div className="w-full max-w-sm mb-4">
          <div className="md:flex md:items-center mb-2">
            <Select
              label=""
              id="bossInput"
              value={bossSelected}
              onChange={handleChangeBoss}
              options={boosList.map((boss) => {
                return {
                  label: boss.name,
                  value: boss.bossId
                }
              })}
            />
          </div>
          <div className="md:flex md:items-center mb-2">
            <Input
              label="Channel"
              id="channelInput"
              type="number"
              value={channelSelected}
              onChange={handleChangeChannel}
            />
          </div>
          <button className="bg-slate-700 rounded-md shadow-lg dark:shadow-none  text-white p-4" onClick={stampBossRespawn}>บันทึก</button>
        </div>
        <p className="" suppressHydrationWarning>Now: {moment(time).format("hh:mm:ss")}</p>
      </div>
    </div>
  )
}
