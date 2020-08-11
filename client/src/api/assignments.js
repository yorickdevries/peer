import client from "./axiosClient"

export default {
    get(courseId) {
        const params = { courseId: courseId }
        return client.get("assignments/", { params: params })
    }
}
