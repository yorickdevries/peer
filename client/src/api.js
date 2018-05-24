import axios from 'axios'

const client = axios.create({
    baseURL: '/api/',
    json: true
})

export default {
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
    getCurrentPeerReview(assignmentId) {
        return client.get(`assignments/${assignmentId}/review`)
    },
    getPeerReview(peerReviewId) {
        return client.get(`reviews/${peerReviewId}`)
    },
    submitPeerReview(peerReview) {
        return client.post(`/reviews/${peerReview.review.id}/submit`, peerReview)
    },
    getAuthenticated: async() => {
        return client.get('authenticated')
    },
    getUser: () => {
        return client.get('user')
    },
    savePeerReview(peerReviewId, peerReview) {
        return client.put(`reviews/${peerReviewId}`, peerReview)
    }
}

