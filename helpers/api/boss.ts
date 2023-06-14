import BossRespawn from "../../types/bossRespawn";
import SearchParam from "../../types/searchParam";
interface SearchParamReport {
    bossList: Array<string>
}

const apiUrl = process.env.NEXT_PUBLIC_DOMAIN;

const myAPI = {
    getBossList: async() => {
        const responseBoss = await fetch(`${apiUrl}/api/getBossList`);
        return await responseBoss.json();
    },
    getUserList: async() => {
        const responseBoss = await fetch(`${apiUrl}/api/getUserList`);
        return await responseBoss.json();
    },
    getBossTimestamp: async(searchParam: SearchParam) => {
        const responseBossRespawn = await fetch(`${apiUrl}/api/getBossTimestamp`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParam)
        });
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
    },
    getBossTimestampReportDay: async(searchParam: SearchParamReport) => {
        const responseBossRespawn = await fetch(`${apiUrl}/api/getBossTimestampReportDay`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParam)
        });
        return await responseBossRespawn.json();
    },
    getBossTimestampReportAll: async(searchParam: SearchParamReport) => {
        const responseBossRespawn = await fetch(`${apiUrl}/api/getBossTimestampReportAll`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParam)
        });
        return await responseBossRespawn.json();
    }
}
export default myAPI