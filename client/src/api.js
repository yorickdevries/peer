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
    getCurrentPeerReview(assignmentId) {
        return new Promise(resolve => {

                let mock = {
                    id: 1,
                    rubric_assignment_id: 1,
                    file_path: 'www.example.path',
                    comment: "",
                    done: false,

                    form: [
                        {
                            question: {
                                id: 32131,
                                question_number: 1,
                                type: "range",
                                range: 7,
                                question: "How good is the project?"
                            },
                            answer: {
                                answer: null
                            }
                        },
                        {
                            question: {
                                id: 213,
                                question_number: 2,
                                type: "open",
                                question: "Give your thoughts!"
                            },
                            answer: {
                                answer: null
                            }
                        },
                        {
                            question: {
                                id: 312,
                                question_number: 3,
                                type: "mpc",
                                question: "Choose one",
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
                                answer: 23
                            }
                        }
                    ]
                }

            resolve(mock)
        })
    },
    getAuthenticated: async() => {
        return client.get('authenticated')
    },
    getUser: () => {
        return client.get('user')
    }
}

