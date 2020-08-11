import client from "./axiosClient"

export default {
    getEnrolledCourses() {
        return client.get("enrollments/enrolled")
    }
    // getEnrolledUsersWithRole(courseId, role) {
    //     return client.get(`?courseId=${courseId}&role=${role}`)
    // },
    // enrollUser(enrollment) {
    //     return client.post("", enrollment)
    // }
}
