import axios from "axios"

const client = axios.create({
    baseURL: "/api/academicyears/",
    json: true
})

export default {
    getAcademicYears(withActiveYears) {
        let params = { active: withActiveYears }
        return client.get("", { params: params })
    },
    getAllAcademicYears() {
        return client.get("")
    }
}
