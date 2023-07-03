import moment from "moment"
import dynamic from 'next/dynamic'

import Image from "next/image"
const CardBoss = dynamic(import("./cardBoss/cardBoss"))

import BossRespawn from "../../types/bossRespawn"
import ApiBoss from "@/helpers/api/boss"
import { useEffect, useState } from "react"

interface PropsCardBosses {
  bossTimeStampList: BossRespawn[]
  loadingAPI: Boolean
  userId: string
  displayTimeoutSearch: number
  notify: () => void
}

export default function CardBosses(props: PropsCardBosses) {
  const TIME_CAN_EDIT = 59;
  const { bossTimeStampList, loadingAPI, userId, displayTimeoutSearch, notify } = props
  const [time, setTime] = useState(new Date());

  const getIsAutoClipboard = () => {
    if (typeof window !== "undefined") {
      const isAutoClipboard = window.localStorage.getItem('isAutoClipboard') ?? "false"
      return JSON.parse(isAutoClipboard)
    }
  }
  const getTextclipboard = () => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem('textclipboard')
    }
  }
  const triggerGetData = () => {
    ApiBoss.triggerStamp()
  }
  const handleCheckBoss = async (boss: BossRespawn, isFind: Boolean) => {
    let _bossTimeStampList = bossTimeStampList
    const bossIndex = _bossTimeStampList.findIndex((_boss: BossRespawn) => _boss._id === boss._id)
    if (bossIndex !== -1) {
      boss.isCheck = true
      _bossTimeStampList[bossIndex] = boss
      if (isFind) {
        if (!getIsAutoClipboard()) {
          
          let textclipboard = getTextclipboard()
          if (textclipboard) {
            const _textclipboard: any = JSON.parse(textclipboard)
            navigator.clipboard.writeText(`${boss.boss?.name} ${_textclipboard.textFreeChest1 ?? ""}CH${boss.channel}${_textclipboard.textFreeChest2 ?? ""}`);
          } else {
            navigator.clipboard.writeText(`${boss.boss?.name} [CH${boss.channel}] [Free Chest]`);
          }
          // navigator.clipboard.writeText(`${boss.boss?.name} [CH${boss.channel}] [Free Chest] until ${moment().add(2, 'minutes').format('HH:mm:ss')} | Auto Join`);
        }
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
        triggerGetData()
      }
    }
  }
  const displayBossTimeStampList = bossTimeStampList.filter(boss => moment(time).diff(boss.respawnTime, 'minutes') < displayTimeoutSearch && !boss.isCheck)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-3 min-h-[344px]">
        {
          !loadingAPI ?
            displayBossTimeStampList.length > 0 ?
              displayBossTimeStampList.map((boss, index) => (
                <CardBoss 
                  key={`${boss._id}-${index}`}
                  boss={boss}
                  handleCheckBoss={handleCheckBoss}
                  notify={notify}
                  disabledCheckBoss={boss.createdBy !== userId && moment().diff(boss.dieTime, 'minutes') < TIME_CAN_EDIT}
                  time={time}
                />
              ))
              : <div className="self-center text-white text-xl col-span-12 text-center">
                <Image
                  src={"/nya.png"}
                  alt={`nya`}
                  width={180}
                  height={40}
                  className="m-auto mb-3"
                  priority
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
                    priority
                  />
                <div className="text-[#6B86CF] text-4xl font-extrabold mb-3 inline-flex">
                  Loading... 
                  <Image
                      src={"/nya.png"}
                      alt={`nya`}
                      width={50}
                      height={50}
                      className="m-auto ml-2 mb-3 animate-spin border border-[#615f58]"
                      priority
                    />
                  </div>
              </div>
        }
      </div>
    </>
  )
}
