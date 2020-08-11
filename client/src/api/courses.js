import client from "./axiosClient"

export default {
    getEnrollable() {
        return client.get("courses/enrollable")
    },
    // getCourse(courseId) {
    //     return client.get(`${courseId}`)
    // },
    // getCourseRole(courseId) {
    //     return client.get(`${courseId}/enrollment`)
    // },
    // getCourseUnenrolledAssignmentsAsStudent(courseId) {
    //     return client.get(`${courseId}/enrollableassignments`)
    // },
    // getCourseEnrolledAssignmentsAsStudent(courseId) {
    //     return client.get(`${courseId}/enrolledassignments`)
    // },
    enroll(courseId) {
        return client.post(`courses/${courseId}/enroll`)
    }
    // async createCourse(course) {
    //     return client.post("", course)
    // },
    // saveCourse(courseId, course) {
    //     let coursePatch = {
    //         name: course.name,
    //         courseCode: course.courseCode,
    //         enrollable: course.enrollable,
    //         facultyName: course.faculty.name,
    //         academicYearName: course.academicYear.name,
    //         description: course.description
    //     }
    //     return client.patch(`${courseId}`, coursePatch)
    // }
}
