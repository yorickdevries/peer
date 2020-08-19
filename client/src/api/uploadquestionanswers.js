import client from "./axiosClient"

export default {
    post(uploadQuestionId, reviewId, file) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("uploadQuestionId", uploadQuestionId)
        formData.append("reviewId", reviewId)
        formData.append("file", file)
        return client.post("uploadquestionanswers", formData)
    }
}
