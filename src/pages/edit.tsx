import moment from "moment"
import { v4 as uuidv4 } from 'uuid';

import Head from 'next/head'
import { useState, useEffect } from 'react';
import Image from "next/image"

import Input from "../../components/input";
import Select from "../../components/select";
import CardBoss from "../../components/cardBoss";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Boss from "../../types/boss"
import BossRespawn from "../../types/bossRespawn"

import ApiBoss from "@/helpers/api/boss"
import SearchParam from "../../types/searchParam";

interface PropsHome {
  bossList: Boss[]
  bossRespawnList: BossRespawn[]
}
interface optionParentProps {
  label: string
  options: optionProps[]
}
interface optionProps {
  label: string
  value: string
}

export async function getServerSideProps() {
  try {
    const bosses = await ApiBoss.getBossList()
    const bossRespawn = await ApiBoss.getBossTimestamp({
      bossList: []
    })
    return {
      props: { bossList: JSON.parse(JSON.stringify(bosses)), bossRespawnList: JSON.parse(JSON.stringify(bossRespawn)) }
    }
  } catch(e) {
    console.error(e);
  }
  const defaultProps: PropsHome = {
    bossList: [], 
    bossRespawnList: []
  }
  return defaultProps
}

export default function Home(props: PropsHome) {
  const { bossList, bossRespawnList } = props

  const getOptionBoss = () => {
    const bossOptions: optionParentProps[] = []
    for (let index = 0; index < bossList.length; index++) {
      const boss = bossList[index]
      const city = `- ${boss.city}`
      let bossOptionIndex = bossOptions.findIndex((optionParent) => optionParent.label === city)
      if (bossOptionIndex === -1) {
        bossOptions.push({
          label: city,
          options: []
        })
        bossOptionIndex = bossOptions.length - 1
      }
      bossOptions[bossOptionIndex].options.push({
        label: boss.name,
        value: boss._id ?? ""
      })
    }
    return bossOptions
  }
  const getBossTimeStampList = async () => {
    const searchParam: SearchParam = {
      bossList: bossSearch.map(boss => boss.value)
    }
    const bossRespawn = await ApiBoss.getBossTimestamp(searchParam)
    return bossRespawn
  }

  const _bossTimeStampList: Array<BossRespawn> = []
  const bossOptions: optionParentProps[] = getOptionBoss()

  const [time, setTime] = useState(new Date());
  const [channelSelected, setChannelSelected] = useState<number>(1);
  const [overTimeSelected, setOverTimeSelected] = useState<number>(0);
  const [bossTimeStampList, setBossTimeStampList] = useState<Array<BossRespawn>>(_bossTimeStampList);
  const [bossSelected, setBossSelected] = useState<optionProps>(bossOptions[0].options[0]);
  const [bossSearch, setBossSearch] = useState<optionProps[]>([]);

  const handleChangeBoss = (data: any) => {
    setBossSelected(data);
  };
  const handleCheckBoss = async (boss: BossRespawn, isFind: Boolean) => {
    let _bossTimeStampList = bossTimeStampList
    const bossIndex = _bossTimeStampList.findIndex((_boss: BossRespawn) => _boss._id === boss._id)
    if (bossIndex !== -1) {
      boss.isCheck = true
      _bossTimeStampList[bossIndex] = boss
      if (isFind) {
        navigator.clipboard.writeText(`${boss.boss?.name} [CH${boss.channel}] [Free Chest] until ${moment().add(2, 'minutes').format('HH:mm:ss')} | Auto Join`);
      }
      await ApiBoss.checkedBoss(boss._id ?? "", boss.isCheck)
      if (isFind) {
        const newBoss: BossRespawn = {
          bossId: boss.bossId ?? "",
          channel: boss.channel,
          dieTime: new Date(),
          respawnTime: new Date(moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')),
          isCheck: false
        }
        let response: any = await ApiBoss.addBossTimeStamp(newBoss)
        newBoss._id = response.insertedId
      }
      setDataBossTimeStamp()
    }
  }
  const handleChangeChannel = (e: any) => {
    const value = parseInt(e.target.value)
    setChannelSelected(value);
  };
  const handleChangeOverTime = (e: any) => {
    const value = e.target.value
    setOverTimeSelected(value);
  };
  const handleChangeBossSearch = async (data: any) => {
    setBossSearch(data);
  };

  useEffect(() => {
    setDataBossTimeStamp()
  }, [bossSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const stampBossRespawn = async () => {
    const boss = bossList.find(boss => boss._id === bossSelected?.value) ?? {
      name: "",
      _id: "",
      imageUrl: "",
    }
    const currentDate = moment().add((overTimeSelected ?? 0) * -1, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    const newBoss: BossRespawn = {
      bossId: boss._id ?? "",
      channel: channelSelected,
      dieTime: new Date(currentDate),
      respawnTime: new Date(moment(currentDate).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')),
      isCheck: false
    }
    
    let response: any = await ApiBoss.addBossTimeStamp(newBoss)
    newBoss._id = response.insertedId
    await setDataBossTimeStamp()

    // Reset Input
    setOverTimeSelected(0)
  }

  const setDataBossTimeStamp = async () => {
    const bossTimeStampList = await getBossTimeStampList()
    setBossTimeStampList(bossTimeStampList)
    window.localStorage.setItem('bossTimeStampList', JSON.stringify(bossTimeStampList))
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBossTimeStampList(bossRespawnList)
    }
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const displayBossTimeStampList = bossTimeStampList.filter(boss => moment().diff(boss.respawnTime, 'minutes') < 30 && !boss.isCheck)

  const respawnAllBossWithTimeToClipboard = () => {
    const sortBoss = displayBossTimeStampList.map((boss: BossRespawn) => {
      return `${boss.boss?.name} [CH${boss.channel}] ${moment(boss.respawnTime).format("HH:mm:ss")}`
    }).join(" → ")
    navigator.clipboard.writeText(`${sortBoss}`);
    notify()
  }
  const respawnAllBossToClipboard = () => {
    const sortBoss = displayBossTimeStampList.map((boss: BossRespawn) => {
      return `${boss.boss?.name} CH${boss.channel}`
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
    <>
      <Head>
        <title>TOF Boss Respawn Edit</title>
        <meta property="og:title" content="TOF Boss Respawn" key="title" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-[#181826]">
        <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 md:px-8">
          <div className="mb-5">
            <Select
              id="bossInput"
              value={bossSearch}
              label="Boss Search"
              isMulti={true}
              onChange={handleChangeBossSearch}
              options={bossOptions}
            />
          </div>
          <div className="grid  sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-3 min-h-[341px]">
            { 
              displayBossTimeStampList.length > 0 ? 
                displayBossTimeStampList.map((boss, index) => (
                  <CardBoss key={index} boss={boss} handleCheckBoss={handleCheckBoss} notify={notify}/>
                ))
              : <div className="self-center text-white text-xl col-span-12 text-center">
                  <Image
                    src={"/nya.png"}
                    alt={`nya`}
                    width={180}
                    height={40}
                    className="m-auto mb-3"
                  />
                  <div className="text-[#6B86CF] text-4xl font-extrabold mb-3">No Boss Result</div>
                  <div className="">Please Select Boss Timestamp</div>
                  <div>From Below Section</div>
                </div>
            }
          </div>
          <div className="my-4">
            <button className="bg-green-600 disabled:bg-green-800 disabled:text-slate-200 disabled:cursor-not-allowed  text-white rounded-sm p-2 text-center h-[34px] mr-1 text-[12px]"
              onClick={respawnAllBossToClipboard} 
              disabled={displayBossTimeStampList.length === 0}
              >
                Respawn all boss
            </button>
            <button className="bg-green-600 disabled:bg-green-800 disabled:text-slate-200 disabled:cursor-not-allowed  text-white rounded-sm p-2 text-center h-[34px] mr-1 text-[12px]"
              onClick={respawnAllBossWithTimeToClipboard} 
              disabled={displayBossTimeStampList.length === 0}
              >
                Respawn all boss
              With time</button>
          </div>
          <hr className="my-5" />
          <div className="text-white mb-3 text-3xl font-bold">Boss Timestamp</div>
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
    </>
  )
}
