import axios from "axios"
import { succesInterceptor, errorInterceptor } from "./axiosInterceptors"

const client = axios.create({
    baseURL: "/api/enrollments/",
    json: true
})
// Add a response interceptor
client.interceptors.response.use(succesInterceptor, errorInterceptor)

export default {
    getEnrolledCourses(courseId) {
        return client.get("enrolled", { params: { courseId } })
    },
    getEnrolledUsersWithRole(courseId, role) {
        return client.get(`?courseId=${courseId}&role=${role}`)
    },
    enrollUser(enrollment) {
        return client.post("", enrollment)
    }
}
