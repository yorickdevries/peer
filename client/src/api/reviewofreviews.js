import client from "./axiosClient"

export default {
    // get(id) {
    //     return client.get(`reviewofreviews/${id}`)
    // },
    patch(id, submitted, flaggedByReviewer) {
        const body = { submitted, flaggedByReviewer }
        return client.patch(`reviewofreviews/${id}`, body)
    },
    getAnswers(id) {
        return client.get(`reviewofreviews/${id}/answers`)
    }
}
