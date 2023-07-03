import moment from "moment"
import BossRespawn from "../../../types/bossRespawn"
interface propsRespawnTime {
  boss: BossRespawn
  time: Date
  notify: () => void
}

const TextRespawnTime = (props: propsRespawnTime) => {
  const { boss, time, notify } = props
  const _boss = boss ?? {
    _id: "",
    bossId: "",
    channel: "",
    dieTime: "",
    respawnTime: "",
    isCheck: "",
    boss: "",
    user: "",
    createdBy: ""
  }

  let textRespawn = ""
  const respawnTimeDiff = moment(time).diff(_boss.respawnTime, 'second')
  const respawnTimeSecond = respawnTimeDiff * -1
  const respawnTimeMinute = Math.floor(respawnTimeDiff / 60) * -1
  
  if (respawnTimeSecond < 60 && respawnTimeSecond > 0) {
    textRespawn = `Respawn in ${respawnTimeSecond} seconds`
  } else {
    if (respawnTimeMinute > 1 || (respawnTimeMinute * -1) > 1) {
      textRespawn = `Respawn in ${respawnTimeMinute} minutes`
    } else {
      textRespawn = `Respawn in ${respawnTimeMinute} minute`
    }
  }

  const respawnBossToClipboard = () => {
    navigator.clipboard.writeText(`${_boss.boss?.name} [CH${_boss.channel}] ${textRespawn}`);
    notify()
  }
  
  return (
    <div className="text-[18px] cursor-pointer" onClick={ respawnBossToClipboard }>
      { textRespawn }
    </div>
  )
}

export default TextRespawnTime
