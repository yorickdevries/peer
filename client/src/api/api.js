import axios from "axios"
import assignmentApi from "./assignmentApi"
import courseApi from "./courseApi"
import facultiesApi from "./facultyApi"
import academicYearsApi from "./academicYearsApi"
import enrollmentApi from "./enrollmentApi"
import submissionApi from "./submissionApi"
import submissionquestionnairesApi from "./submissionquestionnairesApi"
import openquestionsApi from "./openquestionsApi"

const client = axios.create({
    baseURL: "/api/",
    json: true
})

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
    ...submissionApi,
    ...submissionquestionnairesApi,
    ...openquestionsApi
}
