import Boss from "./boss"
import User from "./user"
export default interface BossRespawn {
  _id?: string
  bossId: string
  channel: number
  dieTime: Date
  respawnTime: Date
  isCheck: boolean
  boss?: Boss
  user?: User
  createdBy: string
}