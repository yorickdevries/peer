import axios from "axios"

const client = axios.create({
    baseURL: "/api/",
    json: true
})

export default {
    client
}
