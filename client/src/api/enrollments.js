import client from "./axiosClient"

export default {
    get(courseId, role) {
        const params = { courseId: courseId, role: role }
        return client.get("enrollments/", { params: params })
    },
    getEnrolledCourses() {
        return client.get("enrollments/enrolled")
    },
    post(courseId, userNetid, role) {
        const body = { courseId, userNetid, role }
        return client.post("enrollments/", body)
    },
    delete(userNetid, courseId, role) {
        const params = { userNetid: userNetid, courseId: courseId, role: role }
        return client.delete(`enrollments/`, { params: params })
    }
}
