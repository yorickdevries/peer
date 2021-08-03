import client from "./axiosClient"

export default {
    post(text, decimalPoints, multipleChoiceQuestionId) {
        // convert to integer
        const points = isNaN(decimalPoints) ? null : parseInt(decimalPoints * 100)
        const body = { text, multipleChoiceQuestionId, points }
        return client.post("multiplechoicequestionoptions/", body)
    },
    patch(text, decimalPoints, id) {
        // convert to integer
        const points = isNaN(decimalPoints) ? null : parseInt(decimalPoints * 100)
        const body = { text, points }
        return client.patch(`multiplechoicequestionoptions/${id}`, body)
    },
    delete(id) {
        return client.delete(`multiplechoicequestionoptions/${id}`)
    }
}
