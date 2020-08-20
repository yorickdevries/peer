import client from "./axiosClient"

export default {
    post(rangeQuestionId, reviewId, rangeAnswer) {
        const body = { rangeQuestionId, reviewId, rangeAnswer }
        return client.post("rangequestionanswers", body)
    }
}
