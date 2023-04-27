import BossRespawn from "../../types/bossRespawn";

const apiUrl = process.env.NEXT_PUBLIC_DOMAIN;

const myAPI = {
    getBossList: async() => {
        const responseBoss = await fetch(`${apiUrl}/api/getBossList`);
        return await responseBoss.json();
    },
    getBossTimestamp: async() => {
        const responseBossRespawn = await fetch(`${apiUrl}/api/getBossTimestamp`);
        return await responseBossRespawn.json();
    },
    checkedBoss: async(_id: string, isCheck: boolean) => {
        let response = await fetch(`${apiUrl}/api/checkedBoss`, {
            method: "POST",
            body: JSON.stringify({_id, isCheck} ),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        })
        response = await response.json();
        return response
    },
    addBossTimeStamp: async(newBoss: BossRespawn) => {
        let response: any = await fetch(`${apiUrl}/api/addBossTimeStamp`, {
            method: "POST",
            body: JSON.stringify(newBoss),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        })
        return await response.json();
    }
}
export default myAPI