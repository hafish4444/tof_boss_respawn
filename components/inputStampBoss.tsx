import { useState } from 'react';
import moment from 'moment';
import { OptionProps } from 'react-select';

import BossRespawn from '../types/bossRespawn';

import ApiBoss from "@/helpers/api/boss"
import Input from "./input"
import Select from "./select"

interface optionParentProps {
    label: string
    options: optionProps[]
}
interface optionProps {
    label: string
    value: string
}
interface InputProps {
    bossOptions: optionParentProps[]
    setDataBossTimeStamp: Function
}

export default function InputStampBoss(props: InputProps) {
    const { setDataBossTimeStamp, bossOptions } = props
    const [bossSelected, setBossSelected] = useState<optionProps>(bossOptions[0].options[0]);
    const [channelSelected, setChannelSelected] = useState<number>(1);
    const [overTimeSelected, setOverTimeSelected] = useState<number>(0);

    const handleChangeBoss = (data: any) => {
        setBossSelected(data);
    }
    const handleChangeChannel = (e: any) => {
        const value = parseInt(e.target.value)
        setChannelSelected(value);
    }
    const handleChangeOverTime = (e: any) => {
        const value = e.target.value
        setOverTimeSelected(value);
    }


    const stampBossRespawn = async () => {
        const currentDate = moment().add((overTimeSelected ?? 0) * -1, 'minutes').format('YYYY-MM-DD HH:mm:ss')
        const newBoss: BossRespawn = {
            bossId: bossSelected?.value ?? "",
            channel: channelSelected,
            dieTime: new Date(currentDate),
            respawnTime: new Date(moment(currentDate).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')),
            isCheck: false
        }

        let response: any = await ApiBoss.addBossTimeStamp(newBoss)
        newBoss._id = response.insertedId
        await setDataBossTimeStamp()

        // Reset Input
        setOverTimeSelected(0)
    }

    return (
        <div className="w-full max-w-sm mb-4">
            <div className="md:flex md:items-center mb-2">
                <Select
                    id="bossInput"
                    value={bossSelected}
                    label="Boss Name"
                    onChange={handleChangeBoss}
                    options={bossOptions}
                />
            </div>
            <div className="md:flex md:items-center mb-2">
                <Input
                    id="channelInput"
                    type="number"
                    value={channelSelected}
                    label="Channel"
                    onChange={handleChangeChannel}
                />
            </div>
            <div className="md:flex md:items-center mb-2">
                <Input
                    id="overTimeInput"
                    type="number"
                    value={overTimeSelected}
                    label="Over Time"
                    onChange={handleChangeOverTime}
                />
            </div>
            <button className="bg-[#A32951] rounded-md shadow-lg dark:shadow-none  text-white p-4 mt-2" onClick={stampBossRespawn}>Stamp</button>
        </div>
    )
}