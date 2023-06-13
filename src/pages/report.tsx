import Head from 'next/head'
import Boss from "../../types/boss"
import BossRespawn from "../../types/bossRespawn"

import ApiBoss from "@/helpers/api/boss"
import moment from 'moment'
import Input from '../../components/input'
import { useState, useEffect, useRef } from 'react';
import Select from '../../components/select'
import { OptionProps } from 'react-select'
interface PropsReport {
  bossList: Boss[]
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
}

export async function getServerSideProps() {
  try {
    const bosses = await ApiBoss.getBossList()
    return {
      props: { 
        bossList: JSON.parse(JSON.stringify(bosses))
      }
    }
  } catch (e) {
    console.error(e);
  }
  const defaultProps: PropsReport = {
    bossList: []
  }
  return defaultProps
}

export default function Home(props: PropsReport) {
  const { bossList} = props
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
  const [bossRespawnDayList, setBossRespawnDayList] = useState<BossRespawn[]>([]);
  const [bossRespawnAllList, setBossRespawnAllList] = useState<BossRespawn[]>([]);
  const [bossRespawnByBossDayList, setBossRespawnByBossDayList] = useState<BossRespawnByHour[]>([]);
  const [bossRespawnByBossAllList, setBossRespawnByBossAllList] = useState<BossRespawnByHour[]>([]);
  
  console.log('bossRespawnByBossDayList', bossRespawnByBossDayList)
  console.log('bossRespawnByBossAllList', bossRespawnByBossAllList)
  console.log("-------------------------")
  const isMountRef = useRef<boolean>(false);
  
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
  
  const setDataBossTimeStamp = async () => {
    console.log("setDataBossTimeStamp")
    const bossTimestampReportDayList = await getBossTimestampReportDayList()
    setBossRespawnDayList(bossTimestampReportDayList)
    setBossRespawnByBossDayList(getBossRespawnByBossList(bossTimestampReportDayList))

    const bossTimestampReportAllList = await getBossTimestampReportDayAll()
    setBossRespawnAllList(bossTimestampReportAllList)
    setBossRespawnByBossAllList(getBossRespawnByBossList(bossTimestampReportAllList))
  }
  const getBossTimestampReportDayList = async () => {
    const searchParam: SearchParamReport = {
      bossList: bossSearch.map(boss => boss.value)
    }
    const bossRespawn = await ApiBoss.getBossTimestampReportDay(searchParam)
    return bossRespawn
  }
  const getBossTimestampReportDayAll = async () => {
    const searchParam: SearchParamReport = {
      bossList: bossSearch.map(boss => boss.value)
    }
    const bossRespawn = await ApiBoss.getBossTimestampReportAll(searchParam)
    return bossRespawn
  }
  const handleChangeBossSearch = async (data: any) => {
    setBossSearch(data);
  };

  useEffect(() => {
    if (isMountRef.current) {
      console.log("Use effect")
      setDataBossTimeStamp()
    }
    isMountRef.current = true;
  }, [bossSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>TOF Boss Respawn Time: Report</title>
        <meta
          name="description"
          content="Get the edge you need to defeat all the bosses in your game with TOF Boss Respawn. This platform makes it easy to track respawn times, so you can plan your strategy and come out on top."
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
            <div className="md:flex md:items-center mb-2">
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
                <thead className='bg-[#252531]'>
                  <tr>
                    <th className='p-3' align='left'>Name</th>
                    <th className='p-3'>Amount Stamp</th>
                  </tr>
                </thead>
                <tbody className='bg-[#52525C]'>
                  {/* {
                    bossRespawnByBossDayList.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td className='px-3 py-2'>{data.name}</td>
                          <td className='px-3 py-2' align='center'>{data.amount}</td>
                        </tr>
                      )
                    })
                  } */}
                  <tr >
                    <td className='px-3 py-2'>ALL</td>
                    <td className='px-3 py-2' align='center'>-</td>
                  </tr>
                  {
                    bossRespawnByBossAllList.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td className='px-3 py-2'>{data.name}</td>
                          <td className='px-3 py-2' align='center'>{data.amount}</td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
          </div>
        </div>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
          <div className='bg-[#353541] text-white px-5 py-4 rounded'>
              <table className="table-full w-full">
                <thead className='bg-[#252531]'>
                  <tr>
                    <th className='p-3' align='left'>Name</th>
                    <th className='p-3'>Channel</th>
                    <th className='p-3'>Death Time</th>
                    <th className='p-3'>Stamp By</th>
                  </tr>
                </thead>
                <tbody className='bg-[#52525C]'>
                  {
                    bossRespawnDayList.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td className='px-3 py-2'>{data.boss?.name}</td>
                          <td className='px-3 py-2' align='center'>{data.channel}</td>
                          <td className='px-3 py-2' align='center'>{moment(data.dieTime).format('HH:mm:ss') }</td>
                          <td className='px-3 py-2' align='center'>{data.createdBy.substring(data.createdBy.length - 12)}</td>
                        </tr>
                      )
                    })
                  }
                  {
                    bossRespawnAllList.map((data, index) => {
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
          </div>
        </div>
      </div>
    </>
  )
}
