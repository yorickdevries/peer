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
        return client.get(`assignments/${courseId}`)
    },
    getAuthenticated: async() => {
        return client.get('authenticated')
    },
    getUser: () => {
        return client.get('user')
    }
}