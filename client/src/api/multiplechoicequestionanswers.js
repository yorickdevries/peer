import client from "./axiosClient"

export default {
    post(multipleChoiceQuestionId, reviewId, multipleChoiceQuestionOptionId) {
        const body = { multipleChoiceQuestionId, reviewId, multipleChoiceQuestionOptionId }
        return client.post("multiplechoicequestionanswers", body)
    }
}
