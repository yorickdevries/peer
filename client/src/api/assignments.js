import client from "./axiosClient"

export default {
    getAllForCourse(courseId) {
        const params = { courseId: courseId }
        return client.get("assignments/", { params: params })
    },
    get(id) {
        return client.get(`assignments/${id}`)
    },
    post(
        name,
        courseId,
        reviewsPerUser,
        enrollable,
        reviewEvaluation,
        publishDate,
        dueDate,
        reviewPublishDate,
        reviewDueDate,
        reviewEvaluationDueDate,
        description,
        externalLink,
        file
    ) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("name", name)
        formData.append("courseId", courseId)
        formData.append("reviewsPerUser", reviewsPerUser)
        formData.append("enrollable", enrollable)
        formData.append("reviewEvaluation", reviewEvaluation)
        formData.append("publishDate", publishDate.toISOString())
        formData.append("dueDate", dueDate.toISOString())
        formData.append("reviewPublishDate", reviewPublishDate.toISOString())
        formData.append("reviewDueDate", reviewDueDate.toISOString())
        if (reviewEvaluationDueDate) {
            formData.append("reviewEvaluationDueDate", reviewEvaluationDueDate.toISOString())
        } else {
            formData.append("reviewEvaluationDueDate", null)
        }
        if (!description) {
            description = null
        }
        formData.append("description", description)
        if (!externalLink) {
            externalLink = null
        }
        formData.append("externalLink", externalLink)
        if (file) {
            formData.append("file", file)
        }
        return client.post("assignments/", formData)
    }
}
