import axios from "axios"

const client = axios.create({
    baseURL: "/api/submissions/",
    json: true
})

export default {
    postSubmission(formData, config) {
        return client.post("", formData, config)
    }
}
