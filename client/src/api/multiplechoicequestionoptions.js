import client from "./axiosClient"

export default {
    post(text, multipleChoiceQuestionId) {
        const body = { text, multipleChoiceQuestionId }
        return client.post("multiplechoicequestionoptions/", body)
    },
    patch(text, id) {
        const body = { text }
        return client.patch(`multiplechoicequestionoptions/${id}`, body)
    },
    delete(id) {
        return client.delete(`multiplechoicequestionoptions/${id}`)
    }
}
