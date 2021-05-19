import client from "./axiosClient"

export default {
    // Returns an array of annotations associated with the specified review
    getAnnotations(reviewId) {
        const params = { reviewId: reviewId }
        return client.get("codeannotations", { params: params })
    },
    // Send a new annotation
    postAnnotation(reviewId, commentText, startLineNumber, endLineNumber, selectedFile) {
        const body = {
            reviewId: reviewId,
            commentText: commentText,
            startLineNumber: startLineNumber,
            endLineNumber: endLineNumber,
            selectedFile: selectedFile
        }
        return client.post("codeannotations", body)
    },
    deleteAnnotation(id) {
        return client.delete(`codeannotations/${id}`)
    }
}
