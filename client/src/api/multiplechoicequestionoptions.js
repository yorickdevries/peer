import client from "./axiosClient"

export default {
    post(option, multipleChoiceQuestionId) {
        const points = isNaN(option.points) ? null : parseInt(option.points * 100)
        const { text } = option
        const body = { text, multipleChoiceQuestionId, points }
        return client.post("multiplechoicequestionoptions/", body)
    },
    patch(option, id) {
        const points = isNaN(option.points) ? null : parseInt(option.points * 100)
        const { text } = option
        const body = { text, points }
        return client.patch(`multiplechoicequestionoptions/${id}`, body)
    },
    delete(id) {
        return client.delete(`multiplechoicequestionoptions/${id}`)
    }
}
