import client from "./axiosClient"
// subroutes
import faculties from "./faculties"
import academicYears from "./academicYears"
import courses from "./courses"
import enrollments from "./enrollments"

export default {
    getAuthenticated: () => {
        return client.get("authenticated")
    },
    getMe() {
        return client.get("me")
    },
    faculties: faculties,
    academicYears: academicYears,
    courses: courses,
    enrollments: enrollments
}
