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
    postMultipleStaff(file, courseId) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("courseId", courseId)
        console.log(courseId)
        const body = { courseId }
        return client.post("enrollments/enrollMultiple", formData, body)
    },
    delete(userNetid, courseId) {
        const params = { userNetid: userNetid, courseId: courseId }
        return client.delete(`enrollments/`, { params: params })
    }
}
