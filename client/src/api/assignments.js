import client from "./axiosClient"

export default {
    getAllForCourse(courseId) {
        const params = { courseId: courseId }
        return client.get("assignments/", { params: params })
    },
    get(id) {
        return client.get(`assignments/${id}`)
    },
    getGroup(id) {
        return client.get(`assignments/${id}/group`)
    },
    getSubmissions(assignmentId, groupId) {
        const params = { groupId }
        return client.get(`assignments/${assignmentId}/submissions`, { params: params })
    },
    getLatestSubmission(assignmentId, groupId) {
        const params = { groupId }
        return client.get(`assignments/${assignmentId}/latestsubmission`, { params: params })
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
        file,
        submissionExtensions
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
        formData.append("file", file)
        formData.append("submissionExtensions", submissionExtensions)
        return client.post("assignments/", formData)
    },
    patch(
        id,
        name,
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
        file,
        submissionExtensions
    ) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("name", name)
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
        // if file is undefined, the file is not attached, in case of null it will be removed
        if (file !== undefined) {
            formData.append("file", file)
        }
        formData.append("submissionExtensions", submissionExtensions)
        return client.patch(`assignments/${id}`, formData)
    },
    enroll(id) {
        return client.post(`assignments/${id}/enroll`)
    }
}
