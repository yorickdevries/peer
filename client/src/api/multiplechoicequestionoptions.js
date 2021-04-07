import { postOption, patchOption, deleteOption } from "./utils/options"

export default {
    post(option, multipleChoiceQuestionId) {
        let body = option
        body.multipleChoiceQuestionId = multipleChoiceQuestionId
        return postOption("multiplechoicequestionoptions/", body)
    },
    patch(option, id) {
        return patchOption(`multiplechoicequestionoptions/${id}`, option)
    },
    delete(id) {
        return deleteOption(`multiplechoicequestionoptions/${id}`)
    }
}
