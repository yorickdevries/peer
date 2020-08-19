import client from "./axiosClient"

export default {
    post(text, checkboxQuestionId) {
        const body = { text, checkboxQuestionId }
        return client.post("checkboxquestionoptions/", body)
    },
    patch(text, id) {
        const body = { text }
        return client.patch(`checkboxquestionoptions/${id}`, body)
    },
    delete(id) {
        return client.delete(`checkboxquestionoptions/${id}`)
    }
}
