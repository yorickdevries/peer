import client from "./axiosClient"

export default {
    post(option, checkboxQuestionId) {
        const { text, points } = option
        const body =
            points !== undefined && points !== null
                ? { text, points: String(points), checkboxQuestionId }
                : { text, checkboxQuestionId }
        return client.post("checkboxquestionoptions/", body)
    },
    patch(option, id) {
        const { text, points } = option
        const body = points !== undefined && points !== null ? { text, points: String(points) } : { text }
        return client.patch(`checkboxquestionoptions/${id}`, body)
    },
    delete(id) {
        return client.delete(`checkboxquestionoptions/${id}`)
    }
}
