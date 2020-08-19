import client from "./axiosClient"

export default {
    post(checkboxQuestionId, reviewId, checkboxQuestionOptionIds) {
        const body = { checkboxQuestionId, reviewId, checkboxQuestionOptionIds }
        return client.post("checkboxquestionanswers", body)
    }
}
