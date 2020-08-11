import axios from "axios"
import { succesInterceptor, errorInterceptor } from "./axiosInterceptors"

const client = axios.create({
    baseURL: "/api/",
    json: true
})
// Add a response interceptor
client.interceptors.response.use(succesInterceptor, errorInterceptor)

export default client
