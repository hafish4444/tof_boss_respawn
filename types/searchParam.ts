export default interface SearchParam {
    bossList: Array<string>
    userId: string
    channel: number | ""
    displayTimeout: number
    limit: number
}