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
    postMultipleTAs(file) {
        console.log("second func run")
        const formData = new FormData()
        formData.append("file", file)
        return client.post("enrollments/enrollMultiple", formData)
    }
}
