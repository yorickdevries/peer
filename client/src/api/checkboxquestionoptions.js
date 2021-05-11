import client from "./axiosClient"

export default {
    post(text, decimalPoints, checkboxQuestionId) {
        // convert to integer
        const points = isNaN(decimalPoints) ? null : parseInt(decimalPoints * 100)
        const body = { text, checkboxQuestionId, points }
        return client.post("checkboxquestionoptions/", body)
    },
    patch(text, decimalPoints, id) {
        // convert to integer
        const points = isNaN(decimalPoints) ? null : parseInt(decimalPoints * 100)
        const body = { text, points }
        return client.patch(`checkboxquestionoptions/${id}`, body)
    },
    delete(id) {
        return client.delete(`checkboxquestionoptions/${id}`)
    }
}
