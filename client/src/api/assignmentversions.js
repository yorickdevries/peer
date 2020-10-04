import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`assignmentversions/${id}`)
    },
    post(name, assignmentId, reviewsPerUserPerAssignmentVersionToReview) {
        const body = { name, assignmentId, reviewsPerUserPerAssignmentVersionToReview }
        return client.post("assignmentversions", body)
    },
    patch(id, name, assignmentVersionsToReview, reviewsPerUserPerAssignmentVersionToReview, selfReview) {
        const body = {
            name,
            assignmentVersionsToReview,
            reviewsPerUserPerAssignmentVersionToReview,
            selfReview
        }
        return client.patch(`assignmentversions/${id}`, body)
    }
}
