import client from "./axiosClient"

export default {
    get(reviewId, fileId) {
        const params = { reviewId, fileId }
        return client.get("pdfannotations", { params: params })
    },
    post(annotation, reviewId, fileId) {
        const body = {
            annotation: annotation,
            reviewId: reviewId,
            fileId: fileId
        }
        return client.post("pdfannotations", body)
    },
    patch(id, annotation) {
        const body = {
            annotation: annotation
        }
        return client.patch(`pdfannotations/${id}`, body)
    },
    delete(id) {
        return client.delete(`pdfannotations/${id}`)
    }
}
