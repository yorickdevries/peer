//import client from "./axiosClient"

export default {
    // TODO: create API to send code comments to the server
    // Also update usages in CodeAnnotator.vue on lines 99 and 172
    post() {
        return
    },
    get() {
        return []
    }

    /* Ideas for get and post methods
    post(annotationText, annotationLine, reviewId, fileId) {
        const body = {
            annotationText: annotationText,
            annotationLine: annotationLine,
            reviewId: reviewId,
            fileId: fileId
        }
        return client.post("codeannotation", body)
    },
    get(/*reviewId, fileId) {
        const params = { reviewId, fileId }
        return [] //client.get("codeannotation", { params: params })
    }*/
}
