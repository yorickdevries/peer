import client from "./axiosClient"

export default {
    post(assignmentId) {
        const body = { assignmentId: assignmentId }
        return client.post("submissionquestionnaires/", body)
    },
    get(id) {
        return client.get(`submissionquestionnaires/${id}`)
    },
    copyQuestions(id, copyFromQuestionnaireId) {
        const body = { copyFromQuestionnaireId }
        return client.patch(`submissionquestionnaires/${id}/copyquestions`, body)
    }
}
