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
    getUnenrolledCourses() {
        return client.get(`courses/unenrolled`)
    },
    enrollInCourse(courseId) {
        return client.get(`courses/${courseId}/enroll`)
    },
    enrollInAssignment(assignmentId) {
        return client.get(`assignments/${assignmentId}/enroll`)
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
    getCourseEnrolledAssignments(courseId) {
        return client.get(`courses/${courseId}/assignments/enrolled`)
    },
    getCourseAssignmentsUnenrolled(courseId) {
        return client.get(`courses/${courseId}/assignments/unenrolled`)
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
    unSubmitPeerReview(peerReview) {
        return client.get(`/reviews/${peerReview.review.id}/unsubmit`)
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
    getGivenFeedbackOfAssignment(assignmentId) {
        return client.get(`assignments/${assignmentId}/feedbackGivenToOthers`)
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
    submitAllFilledReviews(rubricId) {
        return client.get(`/rubric/${rubricId}/submitallfilledreviews`)
    },
    getGroupInfo(groupId) {
        return client.get(`/groups/${groupId}`)
    },
    getSubmission(submissionId) {
        return client.get(`/submissions/${submissionId}`)
    },
}

