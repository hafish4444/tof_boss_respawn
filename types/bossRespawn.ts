import Boss from "./boss"
export default interface BossRespawn {
  _id?: string
  bossId: string
  channel: number
  dieTime: Date
  respawnTime: Date
  isCheck: boolean
  boss?: Boss
}