import moment from "moment"

import { useState, useEffect } from 'react';
import Input from "../../components/input";
import Select from "../../components/select";
import { v4 as uuidv4 } from 'uuid';
import CardBoss from "../../components/cardBoss";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const [bossSelected, setBossSelected] = useState<optionProps>(bossOptions[0]);
  const handleChangeBoss = (data: any) => {
    setBossSelected(data);
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
    navigator.clipboard.writeText(`${boss.name} [CH${boss.channel}] [Free Chest] until ${moment().add(2, 'minutes').format('HH:mm:ss')} | Auto Join`);
    window.localStorage.setItem('bossTimeStampList', JSON.stringify(_bossTimeStampList))
  }

  const [channelSelected, setChannelSelected] = useState<number>(1);
  const handleChangeChannel = (e: any) => {
    const value = parseInt(e.target.value)
    setChannelSelected(value);
  };

  const [overTimeSelected, setOverTimeSelected] = useState<number>();
  const handleChangeOverTime = (e: any) => {
    const value = e.target.value
    setOverTimeSelected(value);
  };

  const _bossTimeStampList: Array<BossRespawn> = []
  const [bossTimeStampList, setBossTimeStampList] = useState<Array<BossRespawn>>(_bossTimeStampList);

  const stampBossRespawn = async () => {
    const boss = boosList.find(boss => boss.bossId === bossSelected?.value)
    const currentDate = moment().add(overTimeSelected ?? 0 * -1, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    const newBoss: BossRespawn = {
      bossRespawnId: uuidv4(),
      name: boss?.name ?? "",
      bossId: boss?.bossId ?? "",
      imageUrl: boss?.imageUrl ?? "",
      channel: channelSelected,
      dieTime: new Date(currentDate),
      respawnTime: new Date(moment(currentDate).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')),
      isCheck: false
    }
    const newBossList = [
      ...bossTimeStampList,
      newBoss
    ]
    setBossTimeStampList(newBossList)
    window.localStorage.setItem('bossTimeStampList', JSON.stringify(newBossList))

    // Reset Input
    setOverTimeSelected(undefined)
  }


  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(window.localStorage.getItem('bossTimeStampList'))
      setBossTimeStampList(
        JSON.parse(window.localStorage.getItem('bossTimeStampList') ?? "[]")
      )
    }
  }, [])

  const displayBossTimeStampList = bossTimeStampList.filter(boss => moment().diff(boss.respawnTime, 'minutes') < 30 && !boss.isCheck).slice(0, 40).sort((boss1, boss2) => moment(boss1.dieTime).diff(moment(boss2.dieTime)))
  const respawnAllBossWithTimeToClipboard = () => {
    const sortBoss = displayBossTimeStampList.map((boss: BossRespawn) => {
      return `${boss.name} [CH${boss.channel}] ${moment(boss.respawnTime).format("HH:mm:ss")}`
    }).join(" → ")
    navigator.clipboard.writeText(`${sortBoss}`);
    notify()
  }

  const respawnAllBossToClipboard = () => {
    console.log(bossTimeStampList)
    const sortBoss = displayBossTimeStampList.map((boss: BossRespawn) => {
      return `${boss.name}`
    }).join(" → ")
    navigator.clipboard.writeText(`${sortBoss}`);
    notify()
  }

  const notify = () => {
    toast('⌨ Copy to clipboard!', {
      position: "bottom-left",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      pauseOnFocusLoss: false,
      theme: "light",
    });
  }
  return (
    <div className="min-h-screen bg-[#181826]">
      <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 md:px-8">
        <div className="grid  sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-3">
          {displayBossTimeStampList.map((boss, index) => (
            <CardBoss key={index} boss={boss} handleCheckBoss={handleCheckBoss} notify={notify}/>
          ))}
        </div>
        {displayBossTimeStampList.length > 0 ?
          <div className="my-4">
            <button className="bg-green-600 text-white rounded-sm p-2 text-center h-[34px] mr-1 text-[12px]" onClick={respawnAllBossToClipboard}>Respawn all boss</button>
            <button className="bg-green-600 text-white rounded-sm p-2 text-center h-[34px] mr-1 text-[12px]" onClick={respawnAllBossWithTimeToClipboard}>Respawn all boss With time</button>
          </div>
          : ""
        }
        <hr className="my-5" />
        <div className="text-white mb-3 text-3xl font-bold">Boss TimeStamp</div>
        <div className="w-full max-w-sm mb-4">
          <div className="md:flex md:items-center mb-2">
            <Select
              id="bossInput"
              value={bossSelected}
              label="Boss Name"
              onChange={handleChangeBoss}
              options={bossOptions}
            />
          </div>
          <div className="md:flex md:items-center mb-2">
            <Input
              id="channelInput"
              type="number"
              value={channelSelected}
              label="Channel"
              onChange={handleChangeChannel}
            />
          </div>
          <div className="md:flex md:items-center mb-2">
            <Input
              id="overTimeInput"
              type="number"
              value={overTimeSelected}
              label="Over Time"
              onChange={handleChangeOverTime}
            />
          </div>
          <button className="bg-[#A32951] rounded-md shadow-lg dark:shadow-none  text-white p-4 mt-2" onClick={stampBossRespawn}>Stamp</button>
        </div>
        <p className="text-white" suppressHydrationWarning>Now: {moment(time).format("hh:mm:ss")}</p>
      </div>
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}
