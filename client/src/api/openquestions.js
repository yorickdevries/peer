import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`openquestions/${id}`)
    },
    post(text, number, optional, questionnaireId, maxWordCount, minWordCount) {
        const body = { text, number, optional, questionnaireId, maxWordCount, minWordCount }
        return client.post("openquestions/", body)
    },
    patch(id, text, number, optional, maxWordCount, minWordCount) {
        const body = { text, number, optional, maxWordCount, minWordCount }
        return client.patch(`openquestions/${id}`, body)
    },
    delete(id) {
        return client.delete(`openquestions/${id}`)
    },
}
