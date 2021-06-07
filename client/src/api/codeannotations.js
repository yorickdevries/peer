import client from "./axiosClient"

export default {
    // Returns an array of annotations associated with the specified review
    getAnnotations(reviewId) {
        const params = { reviewId: reviewId }
        return client.get("codeannotations", { params: params })
    },
    // Send a new annotation
    postAnnotation(reviewId, annotationText, startLineNumber, endLineNumber, selectedFile) {
        const body = {
            reviewId: reviewId,
            annotationText: annotationText,
            startLineNumber: startLineNumber,
            endLineNumber: endLineNumber,
            selectedFile: selectedFile
        }
        return client.post("codeannotations", body)
    },
    deleteAnnotation(id) {
        return client.delete(`codeannotations/${id}`)
    },
    patchAnnotation(id, annotationText) {
        const body = { annotationText: annotationText }
        return client.patch(`codeannotations/${id}`, body)
    },
    getMaxAnnotationLength() {
        return client.get("codeannotations/getMaxAnnotationLength")
    }
}
