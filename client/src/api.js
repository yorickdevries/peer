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
    getAssignmentReviews(assignmentId) {
        return client.get(`/assignments/${assignmentId}/allreviews`)
    },
    saveAssignment(assignmentId, assignment) {
        return client.put(`assignments/${assignmentId}`, assignment)
    },
    getAssignmentGroups(assignmentId) {
        return client.get(`/assignments/${assignmentId}/groups`)
    },
    getUsersGroupById(groupId) {
        return client.get(`/groups/${groupId}/users`)
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
    getAssignmentLatestSubmission(assignmentId) {
        return client.get(`assignments/${assignmentId}/latestsubmission`)
    },
    getAssignmentAllSubmissions(assignmentId) {
        return client.get(`assignments/${assignmentId}/allsubmissions`)
    },
    getAssignmentAllLatestSubmissions(assignmentId) {
        return client.get(`assignments/${assignmentId}/alllatestsubmissions`)
    },
    getCurrentRoleForCourse(courseId) {
        return client.get(`courses/${courseId}/role`)
    },
    getFeedbackOfAssignment(assignmentId) {
        return client.get(`assignments/${assignmentId}/feedback`)
    },
    getGroupMembersOfAssignment(assignmentId) {
        return client.get(`assignments/${assignmentId}/group`)
    },
    getUsersWithRole(courseId, role) {
        return client.get(`courses/${courseId}/users/${role}`)
    },
    getAssignmentReviewsStudent(assignmentId) {
        return client.get(`/assignments/${assignmentId}/reviews`)
    },
    shuffleGroups(assignmentId) {
        return client.get(`/assignments/${assignmentId}/distributeReviews`)
    },
    getSubmission(submissionId) {
        return client.get(`/submissions/${submissionId}`)
    },
}

