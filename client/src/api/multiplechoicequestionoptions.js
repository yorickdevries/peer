import client from "./axiosClient"

export default {
    post(option, multipleChoiceQuestionId) {
        const { text, points } = option
        const body =
            points !== undefined
                ? { text, points: String(points), multipleChoiceQuestionId }
                : { text, multipleChoiceQuestionId }
        return client.post("multiplechoicequestionoptions/", body)
    },
    patch(option, id) {
        const { text, points } = option
        const body = points !== undefined ? { text, points: String(points) } : { text }
        return client.patch(`multiplechoicequestionoptions/${id}`, body)
    },
    delete(id) {
        return client.delete(`multiplechoicequestionoptions/${id}`)
    }
}
