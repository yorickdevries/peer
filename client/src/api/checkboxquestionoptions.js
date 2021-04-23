import client from "./axiosClient"

export default {
    post(option, checkboxQuestionId) {
        const points = isNaN(option.points) ? null : parseInt(option.points * 100)
        const { text } = option
        const body = { text, checkboxQuestionId, points }
        return client.post("checkboxquestionoptions/", body)
    },
    patch(option, id) {
        const points = isNaN(option.points) ? null : parseInt(option.points * 100)
        const { text } = option
        const body = { text, points }
        return client.patch(`checkboxquestionoptions/${id}`, body)
    },
    delete(id) {
        return client.delete(`checkboxquestionoptions/${id}`)
    }
}
