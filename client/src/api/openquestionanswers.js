import client from "./axiosClient"

export default {
    post(openQuestionId, reviewId, openAnswer) {
        const body = { openQuestionId, reviewId, openAnswer }
        return client.post("openquestionanswers", body)
    }
}
