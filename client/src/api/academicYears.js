import axios from "axios"
import { succesInterceptor, errorInterceptor } from "./axiosInterceptors"

const client = axios.create({
    baseURL: "/api/academicyears/",
    json: true
})
// Add a response interceptor
client.interceptors.response.use(succesInterceptor, errorInterceptor)

export default {
    get(active) {
        const params = { active: active }
        return client.get("", { params: params })
    }
}
