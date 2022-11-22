import client from "./axiosClient"

export default {
    get() {
        return client.get("faculties/")
    },
    getById(id) {
        return client.get(`faculties/${id}`)
    },
    delete(id) {
        return client.delete(`faculties/${id}`)
    },
    post(faculty) {
        return client.post("faculties", faculty)
    },
    patch(faculty) {
        const data = { name: faculty.name, longName: faculty.longName }
        return client.patch(`faculties/${faculty.id}`, data)
    }
}
