import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
    baseURL: '/api/',
    json: true
})

export default {
    getCourses: async () => {
        return client.get('courses')
    },
    createCourse: async(course) => {
        return client.post('courses', course)
    }
}