import axios from 'axios'

const client = axios.create({
    baseURL: '/api/',
    json: true
})

export default {
    client,
    getCourses: async () => {
        return client.get('courses')
    },
    getCourse: async (id) => {
        return client.get(`courses/${id}`)
    },
    getEnrolledCourses() {
        return client.get(`courses/enrolled`)
    },
    createCourse: async(course) => {
        return client.post('courses', course)
    },
    getCourseAssignments(courseId) {
        return client.get(`courses/${courseId}/assignments`)
    },
    getAssignment(assignmentId) {
        return client.get(`assignments/${assignmentId}`)
    },
    createAssignment: async(assignment) => {
        return client.post('assignments', assignment)
    },
    getCurrentPeerReview(assignmentId) {
        return client.get(`assignments/${assignmentId}/review`)
    },
    getPeerReview(peerReviewId) {
        return client.get(`reviews/${peerReviewId}`)
    },
    submitPeerReview(peerReview) {
        return client.get(`/reviews/${peerReview.review.id}/submit`)
    },
    getAuthenticated: async() => {
        return client.get('authenticated')
    },
    getUser: () => {
        return client.get('user')
    },
    savePeerReview(peerReviewId, peerReview) {
        return client.put(`reviews/${peerReviewId}`, peerReview)
    },
    getSubmission(submissionId) {
        return client.get(`submissions/${submissionId}`)
    },
    deleteSubmission(submissionId) {
        return client.delete(`submissions/${submissionId}`)
    }
}

