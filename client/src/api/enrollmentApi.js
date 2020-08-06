import axios from "axios"

const client = axios.create({
    baseURL: "/api/enrollments/",
    json: true
})

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
