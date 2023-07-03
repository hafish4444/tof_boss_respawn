import moment from "moment"
import BossRespawn from "../../../types/bossRespawn"
import BossImage from "./bossImage";
import TextRespawnTime from "./textRespawnTime";

interface propsCardBoss {
  boss: BossRespawn
  time: Date
  disabledCheckBoss?: boolean
  handleCheckBoss: (boss: BossRespawn, isFind: Boolean) => void
  notify: () => void
}

export default function CardBoss(props: propsCardBoss) {
  const { boss, disabledCheckBoss, time, handleCheckBoss, notify } = props

  const dataBossToClipboard = () => {
    let textclipboard = getTextclipboard()
    if (textclipboard) {
      const _textclipboard: any = JSON.parse(textclipboard)
      navigator.clipboard.writeText(`${boss.boss?.name} ${_textclipboard.textCall1 ?? ""}CH${boss.channel}${_textclipboard.textCall2 ?? ""}`);
    } else {
      navigator.clipboard.writeText(`${boss.boss?.name} [CH${boss.channel}] Auto Join`);
    }
    // navigator.clipboard.writeText(`${boss.boss?.name} <LblRed>[CH${boss.channel}]</</>> Auto Join`);
    notify()
  }

  const getTextclipboard = () => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem('textclipboard')
    }
  }

  return (
    <div className="bg-[#212134] text-white rounded border border-[#242442] shadow-lg dark:shadow-none">
      <div className="relative h-[182px]">
        <BossImage
          imageUrl={boss.boss?.imageUrl ?? ""} 
          bossName={boss.boss?.name ?? ""} 
        />
      </div>
      <div className="px-4 my-2">
        <div className="text-[22px] font-bold cursor-pointer" onClick={ dataBossToClipboard }>{boss.boss?.name}</div>
        <div className="text-[22px] font-bold">Ch. {boss.channel}</div>
      </div>
      <div className="px-4 pb-4">
        <TextRespawnTime boss={boss} time={time} notify={notify} />
        <div className="flex justify-between items-center">
          <div className="text-[20px]">
            {moment(boss.respawnTime).format("hh:mm:ss")}
          </div>
          {
            !disabledCheckBoss ? 
              <div  className="relative">
                <button className="rounded-full bg-green-600 p-2 text-center w-[34px] h-[34px] mr-1 text-[12px]" onClick={() => handleCheckBoss(boss, true)}>✓</button>
                <button className="rounded-full bg-red-600 p-2 text-center w-[34px] h-[34px] text-[12px]" onClick={() => handleCheckBoss(boss, false)}>✗</button>
                <div className="absolute text-[10px] right-0 whitespace-nowrap truncate max-w-[200px]">
                  By { boss.user?.userName ? boss.user.userName : boss.createdBy.substring(boss.createdBy.length - 12) }
                </div>
              </div>
            : <div className="truncate ms-1 max-w-full">By { boss.user?.userName ? boss.user.userName : boss.createdBy.substring(boss.createdBy.length - 12) }</div>
          }
        </div>
      </div>
    </div>
  )
}
