import client from "./axiosClient"

export default {
    //TODO: create API to send code comments to the server
    put(annotationText, annotationLine, reviewId, fileId) {
        const body = {
            annotationText: annotationText,
            annotationLine: annotationLine,
            reviewId: reviewId,
            fileId: fileId
        }
        return client.post("codeannotation", body)
    }
}
