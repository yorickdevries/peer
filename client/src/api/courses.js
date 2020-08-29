import client from "./axiosClient"

export default {
    getEnrollable() {
        return client.get("courses/enrollable")
    },
    get(id) {
        return client.get(`courses/${id}`)
    },
    getEnrollableAssignments(id) {
        return client.get(`courses/${id}/enrollableassignments`)
    },
    getEnrolledAssignments(id) {
        return client.get(`courses/${id}/enrolledassignments`)
    },
    enroll(id) {
        return client.post(`courses/${id}/enroll`)
    },
    enrollment(id) {
        return client.get(`courses/${id}/enrollment`)
    },
    post(name, courseCode, enrollable, facultyId, academicYearId, description) {
        if (!description) {
            description = null
        }
        const course = { name, courseCode, enrollable, facultyId, academicYearId, description }
        return client.post("courses/", course)
    },
    patch(id, name, courseCode, enrollable, facultyId, academicYearId, description) {
        if (!description) {
            description = null
        }
        const course = { name, courseCode, enrollable, facultyId, academicYearId, description }
        return client.patch(`courses/${id}`, course)
    }
}
