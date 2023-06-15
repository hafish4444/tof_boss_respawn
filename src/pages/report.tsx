import Head from 'next/head'
import Boss from "../../types/boss"
import User from "../../types/user"
import BossRespawn from "../../types/bossRespawn"

import ApiBoss from "@/helpers/api/boss"
import moment from 'moment'
import Input from '../../components/input'
import { useState, useEffect, useRef } from 'react';
import Select from '../../components/select'
import { OptionProps } from 'react-select'
import Image from 'next/image'
interface PropsReport {
  bossList: Boss[]
  userList: User[]
}
interface BossRespawnByHour {
  name: string
  amount: number
}
interface optionParentProps {
  label: string
  options: optionProps[]
}
interface optionProps {
  label: string
  value: string
}
interface SearchParamReport {
  bossList: Array<string>
  userList: Array<string>
}

export async function getServerSideProps() {
  try {
    const bosses = await ApiBoss.getBossList()
    const users = await ApiBoss.getUserList()
    return {
      props: { 
        bossList: JSON.parse(JSON.stringify(bosses)),
        userList: JSON.parse(JSON.stringify(users))
      }
    }
  } catch (e) {
    console.error(e);
  }
  const defaultProps: PropsReport = {
    bossList: [],
    userList: []
  }
  return defaultProps
}

export default function Home(props: PropsReport) {
  const { bossList, userList } = props
  const getBossRespawnByBossList = (bossRespawnList: BossRespawn[]) => {
    const bossRespawnByBossList: BossRespawnByHour[] = []
    for(const boss of bossList) {
      let amount = 0
      for(const bossRespawn of bossRespawnList) {
        if (bossRespawn.boss?.name === boss.name) {
          amount += 1
        }
      }
      if (amount) {
        bossRespawnByBossList.push({
          name: boss.name,
          amount: amount
        })
      }
    }
    return bossRespawnByBossList
  }

  const [bossSearch, setBossSearch] = useState<optionProps[]>([]);
  const [userSearch, setUserSearch] = useState<optionProps[]>([]);
  const [bossRespawnDayList, setBossRespawnDayList] = useState<BossRespawn[]>([]);
  const [bossRespawnAllList, setBossRespawnAllList] = useState<BossRespawn[]>([]);
  const [bossRespawnByBossDayList, setBossRespawnByBossDayList] = useState<BossRespawnByHour[]>([]);
  const [bossRespawnByBossAllList, setBossRespawnByBossAllList] = useState<BossRespawnByHour[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // const isMountRef = useRef<boolean>(false);
  
  const MAX_AMOUNT = 100;
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
  const getOptionUser = () => {
    const userOptions: optionProps[] = []
    let userIdByMe = ""
    if (typeof window !== "undefined") {
      userIdByMe = window.localStorage.getItem('userId') ?? ""
    }

    for (let index = 0; index < userList.length; index++) {
      const user = userList[index]
      const userId = user.userId
      let label = user.userId?.substring(user.userId.length - 12) ?? "-"
      if (user.userName) {
        label = user.userName
      }
      if (user.userId === userIdByMe) {
        label = `${label} (You)`
      }

      if (userId && user.userId) {
        userOptions.push({
          label: label,
          value: userId
        })
      }
    }
    return userOptions
  }
  
  const bossOptions: optionParentProps[] = getOptionBoss()
  const userOptions: optionProps[] = getOptionUser()
  
  const setDataBossTimeStamp = async () => {
    setIsLoading(true)
    await Promise.all([getBossTimestampReportDayList(), getBossTimestampReportDayAll()]).then((value: any[]) => {
      const bossTimestampReportDayList = value[0]
      const bossTimestampReportAllList = value[1]
      
      setBossRespawnDayList(bossTimestampReportDayList)
      setBossRespawnByBossDayList(getBossRespawnByBossList(bossTimestampReportDayList))
  
      setBossRespawnAllList(bossTimestampReportAllList)
      setBossRespawnByBossAllList(getBossRespawnByBossList(bossTimestampReportAllList))
    })
    setIsLoading(false)
  }
  const getBossTimestampReportDayList = async () => {
    const searchParam: SearchParamReport = {
      bossList: bossSearch.map(boss => boss.value),
      userList: userSearch.map(user => user.value)
    }
    const bossRespawn = await ApiBoss.getBossTimestampReportDay(searchParam)
    return bossRespawn
  }
  const getBossTimestampReportDayAll = async () => {
    const searchParam: SearchParamReport = {
      bossList: bossSearch.map(boss => boss.value),
      userList: userSearch.map(user => user.value)
    }
    const bossRespawn = await ApiBoss.getBossTimestampReportAll(searchParam)
    return bossRespawn
  }
  const handleChangeBossSearch = async (data: any) => {
    setBossSearch(data);
  };
  const handleChangeUserSearch = async (data: any) => {
    setUserSearch(data);
  };
  const numberWithCommas = (x: string | number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    setDataBossTimeStamp()
  }, [bossSearch, userSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>TOF Boss Respawn Time: Report</title>
        <meta
          name="description"
          content="Get the edge you need to defeat all the bosses in your tower of fantasy (TOF) with TOF Boss Respawn. This platform makes it easy to track respawn times, so you can plan your strategy and come out on top."
          key="desc"
        />
        <meta property="og:title" content="TOF Boss Respawn Time: Report" key="title" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-[#181826]">
        <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 md:px-8">
          <h1 className="max-w-8xl text-white mb-3 text-3xl font-bold">Boss Respawn: Report</h1>
          <div className='bg-[#353541] text-white px-5 py-4 rounded'>
            {/* { moment().startOf('day').format('d HH:mm:ss') } */}
            <div className="grid sm:grid-cols-2 gap-5 mb-3">
              <Select
                id="userInput"
                value={userSearch}
                label="User Search"
                isMulti={true}
                onChange={handleChangeUserSearch}
                options={userOptions}
              />
              <Select
                id="bossInput"
                value={bossSearch}
                label="Boss Search"
                isMulti={true}
                onChange={handleChangeBossSearch}
                options={bossOptions}
              />
            </div>
            <table className="table-full w-full">
              <thead className='bg-[#252531] border-b border-gray-500'>
                <tr>
                  <th className='p-3' align='left'>Name</th>
                  <th className='p-3'>Amount Stamp</th>
                </tr>
              </thead>
              {
                !isLoading ?
                <tbody className='bg-[#52525C]'>
                  {
                    bossRespawnByBossDayList.length > 0 ? 
                    <tr className='bg-[#252531]'>
                      <td className='px-3 py-2' colSpan={2}>Today</td>
                    </tr> : ""
                  }
                  {
                    bossRespawnByBossDayList.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td className='px-3 py-2'>{data.name}</td>
                          <td className='px-3 py-2' align='center'>{numberWithCommas(data.amount)}</td>
                        </tr>
                      )
                    })
                  }
                  <tr className='bg-[#252531]'>
                    <td className='px-3 py-2' colSpan={2}>All</td>
                  </tr>
                  {
                    bossRespawnByBossAllList.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td className='px-3 py-2'>{data.name}</td>
                          <td className='px-3 py-2' align='center'>{numberWithCommas(data.amount)}</td>
                        </tr>
                      )
                    })
                  }
                </tbody>
                : 
                <tbody className="self-center text-white text-xl col-span-12 text-center">
                <tr>
                  <td className='px-3 py-2' colSpan={2}>
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
                    </td>
                  </tr>
                </tbody>
              }
            </table>
          </div>
        </div>
          {
            !isLoading ?
              <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
                <div className='bg-[#353541] text-white px-5 py-4 rounded'>
                    <table className="table-full w-full">
                      <thead className='bg-[#252531] border-b border-gray-500'>
                        <tr>
                          <th className='p-3' align='left'>Name</th>
                          <th className='p-3'>Channel</th>
                          <th className='p-3'>Death Time</th>
                          <th className='p-3'>Stamp By</th>
                        </tr>
                      </thead>
                      <tbody className='bg-[#52525C]'>
                        {
                          [...bossRespawnDayList, ...bossRespawnAllList].slice(0, MAX_AMOUNT).map((data, index) => {
                            return (
                              <tr key={index}>
                                <td className='px-3 py-2'>{data.boss?.name}</td>
                                <td className='px-3 py-2' align='center'>{data.channel}</td>
                                <td className='px-3 py-2' align='center'>{moment(data.dieTime).format('HH:mm:ss') }</td>
                                <td className='px-3 py-2' align='center'>{ data.createdBy?.substring(data.createdBy.length - 12) ?? "-" }</td>
                              </tr>
                            )
                          })
                        }
                      </tbody>
                    </table>
                    <p className='text-end mt-2'>Last {MAX_AMOUNT} records (ALL There are { numberWithCommas(bossRespawnDayList.length + bossRespawnAllList.length) } total data.)</p>
                </div>
              </div>
              : ""
          }
      </div>
    </>
  )
}
