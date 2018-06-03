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
    saveCourse(courseId, course) {
        return client.put(`courses/${courseId}`, course)
    },
    getCourseAssignments(courseId) {
        return client.get(`courses/${courseId}/assignments`)
    },
    getAssignment(assignmentId) {
        return client.get(`assignments/${assignmentId}`)
    },
    createAssignment: async(assignment) => {
        return client.post('/assignments', assignment)
    },
    saveAssignment(assignmentId, assignment) {
        return client.put(`courses/${assignmentId}`, assignment)
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
    getAssignmentSubmission(assignmentId) {
        return client.get(`assignments/${assignmentId}/submission`)
    },
    deleteSubmission(submissionId) {
        return client.delete(`submissions/${submissionId}`)
    }
}

