import axios from "axios"
import assignmentApi from "./assignmentApi"

const client = axios.create({
    baseURL: "/api/",
    json: true
})

export default {
    client,
    ...assignmentApi
}
