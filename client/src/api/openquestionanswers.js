import client from "./axiosClient"

export default {
    post(openQuestionId, reviewId, openAnswer) {
        const body = { openQuestionId, reviewId, openAnswer }
        return client.post("openquestionanswers", body)
    },
    delete(openQuestionId, reviewId) {
        const params = { openQuestionId, reviewId }
        return client.delete("openquestionanswers", { params: params })
    }
}
