import moment from "moment"
import { useState, useEffect } from 'react';
import Image from "next/image"

interface propsCardBoss {
  boss: BossRespawn
  handleCheckBoss: (boss: BossRespawn, isFind: Boolean) => void
  notify: () => void
}

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

export default function CardBoss(props: propsCardBoss) {
  const { boss, handleCheckBoss, notify } = props
  const [time, setTime] = useState(new Date());

  
// Pixel GIF code adapted from https://stackoverflow.com/a/33919020/266535
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  const triplet = (e1: number, e2: number, e3: number) =>
    keyStr.charAt(e1 >> 2) +
    keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
    keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
    keyStr.charAt(e3 & 63)

  const rgbDataURL = (r: number, g: number, b: number) =>
    `data:image/gif;base64,R0lGODlhAQABAPAA${triplet(0, r, g) + triplet(b, 255, 255)
    }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  let textRespawn = ""
  const respawnTimeDiff = moment(time).diff(boss.respawnTime, 'second')
  const respawnTimeSecond = respawnTimeDiff * -1
  const respawnTimeMinute = Math.floor(respawnTimeDiff / 60) * -1
  
  if (respawnTimeSecond < 60 && respawnTimeSecond > 0) {
    textRespawn = `Respawn in ${respawnTimeSecond} seconds`
  } else {
    if (respawnTimeMinute > 1) {
      textRespawn = `Respawn in ${respawnTimeMinute} minutes`
    } else {
      textRespawn = `Respawn in ${respawnTimeMinute} minute`
    }
  }

  const dataBossToClipboard = () => {
    navigator.clipboard.writeText(`${boss.name} [CH${boss.channel}] Auto Join`);
    notify()
  }

  const respawnBossToClipboard = () => {
    navigator.clipboard.writeText(`${boss.name} CH${boss.channel} ${textRespawn}`);
    notify()
  }

  return (
    <div className="bg-[#212134] text-white rounded-sm shadow-lg dark:shadow-none">
      <div className="relative h-[182px]">
        <Image
          src={boss.imageUrl}
          alt={`Boss ${boss.name} Image`}
          placeholder="blur"
          blurDataURL={rgbDataURL(55, 100, 160)}
          fill
        />
      </div>
      <div className="px-4 my-2">
        <div className="text-[22px] font-bold cursor-pointer" onClick={ dataBossToClipboard }>{boss.name}</div>
        <div className="text-[22px] font-bold">Ch. {boss.channel}</div>
      </div>
      <div className="px-4 pb-4">
        <div className="text-[18px] cursor-pointer" onClick={ respawnBossToClipboard }>
          { textRespawn }
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[20px]">
            {moment(boss.respawnTime).format("hh:mm:ss")}
          </div>
          <div>
            <button className="rounded-full bg-green-600 p-2 text-center w-[34px] h-[34px] mr-1 text-[12px]" onClick={() => handleCheckBoss(boss, true)}>✓</button>
            <button className="rounded-full bg-red-600 p-2 text-center w-[34px] h-[34px] text-[12px]" onClick={() => handleCheckBoss(boss, false)}>✗</button>
          </div>
        </div>
      </div>
    </div>
  )
}
