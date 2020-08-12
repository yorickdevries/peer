import client from "./axiosClient"

export default {
    getEnrollable() {
        return client.get("courses/enrollable")
    },
    get(id) {
        return client.get(`courses/${id}`)
    },
    // getCourseRole(courseId) {
    //     return client.get(`${courseId}/enrollment`)
    // },
    // getCourseUnenrolledAssignmentsAsStudent(courseId) {
    //     return client.get(`${courseId}/enrollableassignments`)
    // },
    // getCourseEnrolledAssignmentsAsStudent(courseId) {
    //     return client.get(`${courseId}/enrolledassignments`)
    // },
    enroll(id) {
        return client.post(`courses/${id}/enroll`)
    },
    post(name, courseCode, enrollable, facultyName, academicYearName, description) {
        if (!description) {
            description = null
        }
        const course = { name, courseCode, enrollable, facultyName, academicYearName, description }
        return client.post("courses/", course)
    },
    patch(courseId, name, courseCode, enrollable, facultyName, academicYearName, description) {
        if (!description) {
            description = null
        }
        const course = { name, courseCode, enrollable, facultyName, academicYearName, description }
        return client.patch(`courses/${courseId}`, course)
    }
}
