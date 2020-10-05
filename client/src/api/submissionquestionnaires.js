import client from "./axiosClient"

export default {
    post(assignmentVersionId) {
        const body = { assignmentVersionId: assignmentVersionId }
        return client.post("submissionquestionnaires/", body)
    },
    get(id) {
        return client.get(`submissionquestionnaires/${id}`)
    },
    getReviews(id) {
        return client.get(`submissionquestionnaires/${id}/reviews`)
    },
    copyQuestions(id, copyFromQuestionnaireId) {
        const body = { copyFromQuestionnaireId }
        return client.patch(`submissionquestionnaires/${id}/copyquestions`, body)
    }
}
