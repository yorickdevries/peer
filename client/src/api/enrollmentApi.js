import axios from "axios"

const client = axios.create({
    baseURL: "/api/enrollments/",
    json: true
})

export default {
    getEnrolledCourses(courseId) {
        return client.get("enrolled", { params: { courseId } })
    }
}
