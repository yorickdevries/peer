import axios from "axios"

const client = axios.create({
    baseURL: "/api/faculties/",
    json: true
})

export default {
    getFaculties() {
        return client.get("")
    }
}
