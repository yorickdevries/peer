import axios from "axios"
import { succesInterceptor, errorInterceptor } from "./axiosInterceptors"

const client = axios.create({
    baseURL: "/api/temp/academicyears/",
    json: true
})
// Add a response interceptor
client.interceptors.response.use(succesInterceptor, errorInterceptor)

export default {
    getAcademicYears(withActiveYears) {
        let params = { active: withActiveYears }
        return client.get("", { params: params })
    },
    getAllAcademicYears() {
        return client.get("")
    }
}
