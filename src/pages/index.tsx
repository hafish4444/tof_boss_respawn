import moment from "moment"
import dynamic from 'next/dynamic'
import { v4 as uuidv4 } from 'uuid';
import Pusher, { Channel } from "pusher-js";

import Head from 'next/head'
import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import Image from "next/image"

import Select from "../../components/select";
const CardBoss = dynamic(import("../../components/cardBoss"))
const InputStampBoss = lazy(() => import('../../components/inputStampBoss'));

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Boss from "../../types/boss"
import BossRespawn from "../../types/bossRespawn"
import SearchParam from "../../types/searchParam";

import ApiBoss from "@/helpers/api/boss"
import Input from "../../components/input";
import BtnSetting from "../../components/btnSetting";
interface PropsHome {
  bossList: Boss[]
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
    return {
      props: { bossList: JSON.parse(JSON.stringify(bosses)) }
    }
  } catch (e) {
    console.error(e);
  }
  const defaultProps: PropsHome = {
    bossList: []
  }
  return defaultProps
}

export default function Home(props: PropsHome) {
  const TIME_CAN_EDIT = 59;
  const { bossList } = props

  const _bossTimeStampList: Array<BossRespawn> = []

  const [time, setTime] = useState(new Date());
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [bossTimeStampList, setBossTimeStampList] = useState<Array<BossRespawn>>(_bossTimeStampList);
  const [pusherChannel, setPusherChannel] = useState<Channel>();

  const [bossSearch, setBossSearch] = useState<optionProps[]>([]);
  const [isOnlyMyStamp, setIsOnlyMyStamp] = useState<boolean>(false);
  const [loadingAPI, setLoadingAPI] = useState<boolean>(true);
  const [channelSearch, setChannelSearch] = useState<number | "">("");
  const [limitSearch, setLimitSearch] = useState<number>(40);
  const [isExpandAdvanceSearch, setIsExpandAdvanceSearch] = useState<boolean>(false);
  const advSearchRef = useRef<HTMLInputElement>(null);
  const advSearchBtnRef = useRef<HTMLButtonElement>(null);
  const isMountRef = useRef<boolean>(false);

  const handleChangeChannelSearch = (e: any) => {
    const value = e.target.value
    setChannelSearch(parseInt(value));
  }
  const handleChangeLimitSearch = (e: any) => {
    const value = e.target.value
    setLimitSearch(parseInt(value));
  }

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
  const bossOptions: optionParentProps[] = getOptionBoss()

  const getBossTimeStampList = async () => {
    const searchParam: SearchParam = {
      bossList: bossSearch.map(boss => boss.value),
      userId: isOnlyMyStamp ? userId : "",
      channel: channelSearch,
      limit: limitSearch
    }
    const bossRespawn = await ApiBoss.getBossTimestamp(searchParam)
    return bossRespawn
  }

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
          isCheck: false,
          createdBy: userId
        }
        let response: any = await ApiBoss.addBossTimeStamp(newBoss)
        newBoss._id = response.insertedId
      } else {
        setDataBossTimeStamp()
      }
    }
  }
  const handleChangeBossSearch = async (data: any) => {
    setBossSearch(data);
  };
  const handleClickOnlyMyStamp = async () => {
    setIsOnlyMyStamp(!isOnlyMyStamp)
  }
  const handleClickAdvanceSearch = async () => {
    setIsExpandAdvanceSearch(!isExpandAdvanceSearch)
  }

  const setDataBossTimeStamp = async () => {
    const bossTimeStampList = await getBossTimeStampList()
    setBossTimeStampList(bossTimeStampList)
    window.localStorage.setItem('bossTimeStampList', JSON.stringify(bossTimeStampList))
  }

  const getUserId = async () => {
    if (typeof window !== "undefined") {
      const userId = window.localStorage.getItem('userId') ?? uuidv4()
      window.localStorage.setItem('userId', userId)
      setUserId(userId)
    }
  }
  const getUserName = async () => {
    if (typeof window !== "undefined") {
      const userName = window.localStorage.getItem('userName') ?? ""
      window.localStorage.setItem('userName', userName)
      setUserName(userName)
    }
  }

  useEffect(() => {
    if (isMountRef.current) {
      setDataBossTimeStamp()
    }
    isMountRef.current = true;
  }, [bossSearch, isOnlyMyStamp, channelSearch, limitSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_KEY as string, {
      cluster: process.env.PUSHER_APP_CLUSTER as string
    });
    
    if (typeof window !== "undefined") {
      setLoadingAPI(true);
      getUserId()
      getUserName()
      setDataBossTimeStamp()
      setLoadingAPI(false);
    }
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    const channel = pusher.subscribe("tof-boss-respawn-realtime");
    setPusherChannel(channel)

    return () => {
      clearInterval(interval);
      pusher.unsubscribe("tof-boss-respawn-realtime");
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pusherChannel && pusherChannel.bind) {
      pusherChannel.unbind("boss-stamp-update");
      pusherChannel.bind("boss-stamp-update", async function (data: any) {
        setDataBossTimeStamp()
      });
    }
  }, [pusherChannel, bossSearch, isOnlyMyStamp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.onclick = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (isExpandAdvanceSearch && 
        (
          !(
            advSearchRef.current &&
            advSearchRef.current.contains(targetNode) &&
            targetNode !== advSearchRef.current
          ) &&
          !(
            advSearchBtnRef.current &&
            targetNode === advSearchBtnRef.current
          )
        )
      ) {
        setIsExpandAdvanceSearch(false)
      }
    };
  }, [isExpandAdvanceSearch]);

  const displayBossTimeStampList = bossTimeStampList.filter(boss => moment().diff(boss.respawnTime, 'minutes') < 15 && !boss.isCheck)

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

  const respawnAllBossShotVersionToClipboard = () => {
    let beforeBossId = ""
    let txtBoss = ""
    let index = 0
    for (const boss of displayBossTimeStampList) {
      const isMulti = index + 1 === displayBossTimeStampList.length || displayBossTimeStampList[index + 1].bossId !== boss.bossId
      if (boss.bossId !== beforeBossId) {
        txtBoss += `${boss.boss?.name}(`
      }
      txtBoss += `${boss.channel} ${moment(boss.respawnTime).format("HH:mm")}`
      if (isMulti) {
        txtBoss += `) `
      } else {
        txtBoss += `|`
      }
      beforeBossId = boss.bossId
      index++
    }
    navigator.clipboard.writeText(`${txtBoss}`);
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
        <title>TOF Boss Respawn Time</title>
        <meta
          name="description"
          content="Get the edge you need to defeat all the bosses in your game with TOF Boss Respawn. This platform makes it easy to track respawn times, so you can plan your strategy and come out on top."
          key="desc"
        />
        <meta property="og:title" content="TOF Boss Respawn Time" key="title" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-[#181826]">
        <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 md:px-8">
          <div className="mb-5">
            <div className="mb-3">
              <Select
                id="bossInput"
                value={bossSearch}
                label="Boss Search"
                isMulti={true}
                onChange={handleChangeBossSearch}
                options={bossOptions}
              />
            </div>
            <div className="flex justify-between">
              <button
                className={
                  `
                    transition-all
                    border-2
                    border-[#6346AA]
                    text-white
                    rounded-sm
                    p-2
                    text-center
                    mr-1
                    text-[12px]
                    ${isOnlyMyStamp ? "bg-[#6346AA]" : undefined}
                  `
                }
                onClick={handleClickOnlyMyStamp}
              >
                Only My Stamp
              </button>
              <div className="relative">
                <button
                  ref={advSearchBtnRef}
                  className={
                    `
                      transition-all
                      border-2
                      border-[#6346AA]
                      text-white
                      rounded-sm
                      p-2
                      text-center
                      text-[12px]
                      ${isExpandAdvanceSearch ? "bg-[#6346AA]" : undefined}
                    `
                  }
                  onClick={handleClickAdvanceSearch}
                >
                  Advance Search
                </button>
                <div
                  ref={advSearchRef}
                  className={
                    `
                      absolute
                      bottom-[-102px]
                      right-0
                      text-black
                      bg-white
                      w-[200px]
                      z-10
                      ${!isExpandAdvanceSearch ? "hidden" : undefined}
                    `
                  }
                >
                  <div className="p-1">
                    <div className="md:flex md:items-center mb-2">
                      <Input
                        id="channelSearchInput"
                        type="number"
                        value={channelSearch}
                        label="Channel"
                        onChange={handleChangeChannelSearch}
                      />
                    </div>
                    <div className="md:flex md:items-center">
                      <Input
                        id="channelSearchInput"
                        type="number"
                        value={limitSearch}
                        label="Limit"
                        onChange={handleChangeLimitSearch}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-3 min-h-[344px]">
            {
              !loadingAPI ?
                displayBossTimeStampList.length > 0 ?
                  displayBossTimeStampList.map((boss, index) => (
                    <CardBoss 
                      key={index}
                      boss={boss}
                      handleCheckBoss={handleCheckBoss}
                      notify={notify}
                      disabledCheckBoss={boss.createdBy !== userId && moment().diff(boss.dieTime, 'minutes') < TIME_CAN_EDIT}
                    />
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
                : <div className="self-center text-white text-xl col-span-12 text-center">
                    <Image
                        src={"/nya.png"}
                        alt={`nya`}
                        width={180}
                        height={40}
                        className="m-auto mb-3"
                      />
                    <div className="text-[#6B86CF] text-4xl font-extrabold mb-3 inline-flex">
                      Loading... 
                      <Image
                          src={"/nya.png"}
                          alt={`nya`}
                          width={50}
                          height={50}
                          className="m-auto mb-3 animate-spin border rounded-full border-[#615f58]"
                        />
                      </div>
                  </div>
            }
          </div>
          <div className="mt-5">
            <button className="
                transition-all
                bg-green-600
                hover:bg-green-700
                disabled:bg-green-800
                disabled:text-slate-200
                disabled:cursor-not-allowed
                text-white
                rounded-sm
                p-2
                text-center
                h-[34px]
                mr-1
                text-[12px]
                mb-3
              "
              onClick={respawnAllBossToClipboard}
              disabled={displayBossTimeStampList.length === 0}
            >
              Respawn Time all boss
            </button>
            <button className="
                transition-all
                bg-green-600
                hover:bg-green-700
                disabled:bg-green-800
                disabled:text-slate-200
                disabled:cursor-not-allowed

                text-white
                rounded-sm
                p-2
                text-center
                h-[34px]
                mr-1
                mb-3
                text-[12px]
              "
              onClick={respawnAllBossWithTimeToClipboard}
              disabled={displayBossTimeStampList.length === 0}
            >
              Respawn Time all boss With time
            </button>
            <button className="
                transition-all
                bg-green-600
                hover:bg-green-700
                disabled:bg-green-800
                disabled:text-slate-200
                disabled:cursor-not-allowed

                text-white
                rounded-sm
                p-2
                text-center
                h-[34px]
                mr-1
                mb-3
                text-[12px]
              "
              onClick={respawnAllBossShotVersionToClipboard}
              disabled={displayBossTimeStampList.length === 0}
            >
              Respawn Time all boss With time But Short Than 
            </button>
          </div>
          <hr className="mt-3 mb-4" />
          <h1 className="text-white mb-3 text-3xl font-bold">Boss Timestamp</h1>
          <Suspense fallback={<div>Loading...</div>}>
            <InputStampBoss bossOptions={bossOptions} setDataBossTimeStamp={setDataBossTimeStamp} userId={userId} />
            <p className="text-white" suppressHydrationWarning>Now: {moment(time).format("hh:mm:ss")}</p>
          </Suspense>
          <hr className="mt-3 mb-4" />
          <button 
            className="transition-all bg-[#6346AA] hover:bg-[#41297e] rounded-md shadow-lg dark:shadow-none  text-white p-3 mt-2" 
            onClick={ () => { window.location.href = "/report"} }
          >
            Sumary Page 🠖
          </button>
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
        {/* <BtnSetting 
          userId={userId} 
          userName={userName} 
          getUserName={getUserName}
          setUserName={setUserName}
        /> */}
      </div>
    </>
  )
}
