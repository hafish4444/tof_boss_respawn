import User from "../../types/user";
const apiUrl = process.env.NEXT_PUBLIC_DOMAIN;

const myAPI = {
    getUserList: async() => {
        const responseBoss = await fetch(`${apiUrl}/api/getUserList`);
        return await responseBoss.json();
    },
    updateInfoUser: async(user: User) => {
        let response: any = await fetch(`${apiUrl}/api/updateInfoUser`, {
            method: "POST",
            body: JSON.stringify(user),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        })
        return await response.json();
    }
}
export default myAPI