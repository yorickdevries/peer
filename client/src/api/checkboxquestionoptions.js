import { postOption, patchOption, deleteOption } from "./utils/options"

export default {
    post(option, checkboxQuestionId) {
        let body = option
        body.checkboxQuestionId = checkboxQuestionId
        return postOption("checkboxquestionoptions/", body)
    },
    patch(option, id) {
        return patchOption(`checkboxquestionoptions/${id}`, option)
    },
    delete(id) {
        return deleteOption(`checkboxquestionoptions/${id}`)
    }
}
