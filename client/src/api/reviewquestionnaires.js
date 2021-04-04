import client from "./axiosClient"

export default {
    post(assignmentVersionId) {
        const body = { assignmentVersionId: assignmentVersionId }
        return client.post("reviewquestionnaires/", body)
    },
    get(id) {
        return client.get(`reviewquestionnaires/${id}`)
    },
    copyQuestions(id, copyFromQuestionnaireId) {
        const body = { copyFromQuestionnaireId }
        return client.patch(`reviewquestionnaires/${id}/copyquestions`, body)
    },
    defaultQuestions(id, graded) {
        const body = { graded }
        console.log(body)
        return client.patch(`reviewquestionnaires/${id}/defaultquestions`, body)
    }
}
