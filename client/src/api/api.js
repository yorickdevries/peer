import axios from "axios"
import { succesInterceptor, errorInterceptor } from "./axiosInterceptors"
import assignmentApi from "./assignmentApi"
import courseApi from "./courseApi"
import facultiesApi from "./facultyApi"
import academicYearsApi from "./academicYearsApi"
import enrollmentApi from "./enrollmentApi"
import submissionApi from "./submissionApi"

const client = axios.create({
    baseURL: "/api/",
    json: true
})
// Add a response interceptor
client.interceptors.response.use(succesInterceptor, errorInterceptor)

export default {
    client,
    getUserInfo() {
        return client.get("me")
    },
    ...assignmentApi,
    ...courseApi,
    ...facultiesApi,
    ...academicYearsApi,
    ...enrollmentApi,
    ...submissionApi
}
