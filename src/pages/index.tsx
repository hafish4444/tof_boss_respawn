import moment from "moment"
import dynamic from 'next/dynamic'
import { v4 as uuidv4 } from 'uuid';
import Pusher, { Channel } from "pusher-js";

import Head from 'next/head'
import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import Image from "next/image"

const Input = dynamic(import("../../components/input"));
const Select = dynamic(import("../../components/select"));
const BtnSetting = dynamic(import("../../components/btnSetting"));
const CardBosses = dynamic(import("../../components/cardBosses/cardBosses"))
const InputStampBoss = lazy(() => import('../../components/inputStampBoss'));

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Boss from "../../types/boss"
import BossRespawn from "../../types/bossRespawn"
import SearchParam from "../../types/searchParam";

import ApiBoss from "@/helpers/api/boss"
import Link from "next/link";
import NowDate from "../../components/nowDate";
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

export async function getServerSideProps(ctx: any) {
  try {
    ctx.res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=59'
    )
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
  const { bossList } = props

  const _bossTimeStampList: Array<BossRespawn> = []

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

  const getIsAutoClipboard = () => {
    if (typeof window !== "undefined") {
      const isAutoClipboard = window.localStorage.getItem('isAutoClipboard') ?? "false"
      return JSON.parse(isAutoClipboard)
    }
  }
  
  const triggerGetData = () => {
    ApiBoss.triggerStamp()
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

  const setDataBossTimeStampWithLoad = async () => {
    setLoadingAPI(true);
    await setDataBossTimeStamp()
    setLoadingAPI(false);
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
      getUserId()
      getUserName()
      setDataBossTimeStampWithLoad()
      console.log("Loading in window")
    }
    const channel = pusher.subscribe("tof-boss-respawn-realtime");
    setPusherChannel(channel)
    return () => {
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
          content="Get the edge you need to defeat all the bosses in game tower of fantasy (TOF) with TOF Boss Respawn. This platform makes it easy to track respawn times, so you can plan your strategy and come out on top."
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
                id="bossInputSerch"
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
                        id="limitSearchInput"
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
          <CardBosses
            userId={userId}
            bossTimeStampList={bossTimeStampList}
            loadingAPI={loadingAPI}
            notify={notify}
          />
          <div className="mt-5">
            <button className="
                transition-all
                bg-green-700
                hover:bg-green-800
                disabled:bg-green-900
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
                bg-green-700
                hover:bg-green-800
                disabled:bg-green-900
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
                bg-green-700
                hover:bg-green-800
                disabled:bg-green-900
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
            {/* <NowDate /> */}
          </Suspense>
          <hr className="mt-3 mb-4" />
          <Link
            href = "/report"
          >
            <button 
              className="transition-all bg-[#6346AA] hover:bg-[#41297e] rounded-md shadow-lg dark:shadow-none  text-white p-3 mt-2" 
            >
              Sumary Page 🠖
            </button>
          </Link>
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
        <BtnSetting 
          userId={userId}
          userName={userName}
          getUserName={getUserName}
          setUserName={setUserName}
        />
      </div>
    </>
  )
}
