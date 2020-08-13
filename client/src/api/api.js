import client from "./axiosClient"
// subroutes
import users from "./users"
import faculties from "./faculties"
import academicYears from "./academicYears"
import courses from "./courses"
import enrollments from "./enrollments"
import assignments from "./assignments"

export default {
    getAuthenticated: () => {
        return client.get("authenticated")
    },
    getMe() {
        return client.get("me")
    },
    users: users,
    faculties: faculties,
    academicYears: academicYears,
    courses: courses,
    enrollments: enrollments,
    assignments: assignments
}
