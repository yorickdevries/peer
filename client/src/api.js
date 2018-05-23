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
    createCourse: async(course) => {
        return client.post('courses', course)
    },
    getCourseAssignments(courseId) {
        return client.get(`courses/${courseId}/assignments`)
    },
    getAssignment(assignmentId) {
        return client.get(`assignments/${assignmentId}`)
    },
    getCurrentPeerReview() {
        return new Promise(resolve => {

                let mock = {
                    review: {
                        id: 1,
                        rubric_assignment_id: 1,
                        file_path: 'http://www.example.path',
                        comment: "",
                        done: false,
                    },

                    form: [
                        {
                            question: {
                                id: 32131,
                                question_number: 1,
                                type_question: "range",
                                range: 7,
                                question: "How good is the project?"
                            },
                            answer: {
                                answer: 3
                            }
                        },
                        {
                            question: {
                                id: 213,
                                question_number: 2,
                                type_question: "open",
                                question: "Give your thoughts!"
                            },
                            answer: {
                                answer: "Kapparino"
                            }
                        },
                        {
                            question: {
                                id: 312,
                                question_number: 3,
                                type_question: "mpc",
                                question: "Choose one.",
                                options: [
                                    {
                                        id: 23,
                                        option: "Option A"
                                    },
                                    {
                                        id: 55,
                                        option: "Option B"
                                    }
                                ]
                            },
                            answer: {
                                answer_option: 23
                            }
                        }
                    ]
                }

            resolve(mock)
        })
    },
    submitPeerReview(peerReview) {
        return client.post(`/reviews/${peerReview.review.id}/submit`, peerReview)
    },
    getAuthenticated: async() => {
        return client.get('authenticated')
    },
    getUser: () => {
        return client.get('user')
    }
}

