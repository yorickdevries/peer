import client from "./axiosClient"

export default {
    getAllForCourse(courseId) {
        const params = { courseId: courseId }
        return client.get("assignments/", { params: params })
    },
    get(id) {
        return client.get(`assignments/${id}`)
    },
    publish(id) {
        return client.patch(`assignments/${id}/publish`)
    },
    closeSubmission(id) {
        return client.patch(`assignments/${id}/closesubmission`)
    },
    getGroup(id) {
        return client.get(`assignments/${id}/group`)
    },
    getFinalSubmission(assignmentId, groupId) {
        const params = { groupId }
        return client.get(`assignments/${assignmentId}/finalsubmission`, { params: params })
    },
    post(
        name,
        courseId,
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
        submissionExtensions,
        blockFeedback,
        lateSubmissions,
        lateSubmissionReviews,
        lateReviewEvaluations,
        automaticStateProgression,
        assignmentType
    ) {
        // Just some filler usage of assignmentType to stop linter complaining
        console.log(assignmentType)
        // Create formData and append data
        const formData = new FormData()
        formData.append("name", name)
        formData.append("courseId", courseId)
        formData.append("enrollable", enrollable)
        formData.append("reviewEvaluation", reviewEvaluation)
        formData.append("publishDate", publishDate.toISOString())
        formData.append("dueDate", dueDate.toISOString())
        formData.append("reviewPublishDate", reviewPublishDate.toISOString())
        formData.append("reviewDueDate", reviewDueDate.toISOString())
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
        formData.append("blockFeedback", blockFeedback)
        formData.append("lateSubmissions", lateSubmissions)
        formData.append("lateSubmissionReviews", lateSubmissionReviews)
        if (reviewEvaluation) {
            formData.append("reviewEvaluationDueDate", reviewEvaluationDueDate.toISOString())
            formData.append("lateReviewEvaluations", lateReviewEvaluations)
        } else {
            formData.append("reviewEvaluationDueDate", null)
            formData.append("lateReviewEvaluations", null)
        }
        formData.append("automaticStateProgression", automaticStateProgression)
        return client.post("assignments/", formData)
    },
    patch(
        id,
        name,
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
        submissionExtensions,
        blockFeedback,
        lateSubmissions,
        lateSubmissionReviews,
        lateReviewEvaluations,
        automaticStateProgression,
        assignmentType
    ) {
        // Just some filler usage of assignmentType to stop linter complaining
        console.log(assignmentType)
        // Create formData and append data
        const formData = new FormData()
        formData.append("name", name)
        formData.append("enrollable", enrollable)
        formData.append("reviewEvaluation", reviewEvaluation)
        formData.append("publishDate", publishDate.toISOString())
        formData.append("dueDate", dueDate.toISOString())
        formData.append("reviewPublishDate", reviewPublishDate.toISOString())
        formData.append("reviewDueDate", reviewDueDate.toISOString())
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
        formData.append("blockFeedback", blockFeedback)
        formData.append("lateSubmissions", lateSubmissions)
        formData.append("lateSubmissionReviews", lateSubmissionReviews)
        if (reviewEvaluation) {
            formData.append("reviewEvaluationDueDate", reviewEvaluationDueDate.toISOString())
            // change value in case the value isnt set
            if (lateReviewEvaluations === null) {
                lateReviewEvaluations = false
            }
            formData.append("lateReviewEvaluations", lateReviewEvaluations)
        } else {
            formData.append("reviewEvaluationDueDate", null)
            formData.append("lateReviewEvaluations", null)
        }
        formData.append("automaticStateProgression", automaticStateProgression)
        return client.patch(`assignments/${id}`, formData)
    },
    enroll(id) {
        return client.post(`assignments/${id}/enroll`)
    }
}
