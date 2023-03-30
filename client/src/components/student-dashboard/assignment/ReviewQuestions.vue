<template>
    <b-card v-if="answers" no-body class="mt-3" style="padding: 1.25rem">
        <!--Question Information-->
        <b-card v-for="(question, index) in questionnaire.questions" :key="question.id" class="mb-3" no-body>
            <b-card-header class="d-flex align-items-center">
                <span class="w-100">Question {{ question.number }} of {{ questionnaire.questions.length }}</span>
                <b-badge variant="primary" class="ml-2 float-right p-1"
                    >{{ question.type.toUpperCase() }} QUESTION
                </b-badge>
                <b-badge pill v-if="question.optional" variant="secondary" class="ml-2 float-right p-1">
                    OPTIONAL
                </b-badge>
                <b-badge v-else variant="danger" class="ml-2 float-right p-1"> REQUIRED </b-badge>
            </b-card-header>

            <b-card-body>
                <!-- Text-->
                <h4>{{ question.text }}</h4>
                <!-- OPEN QUESTION -->
                <MarkdownEditorViewer
                    v-if="question.type === 'open'"
                    :answer-object="answers[question.id]"
                    :displayeditor="!(review.submitted || reviewsAreReadOnly)"
                    @shortcut-save="questionIndex = index"
                />

                <!-- MULTIPLE CHOICE QUESTION -->
                <!--prettier-ignore-->
                <b-form-radio-group
                    v-if="question.type === 'multiplechoice'"
                    v-model="answers[question.id].answer"
                    @input="
                                        ;(answers[question.id].answer !== null ? (answers[question.id].changed = true) : ''),
                                            (questionIndex = index)
                                    "
                    stacked
                    required
                    :disabled="review.submitted || reviewsAreReadOnly"
                >
                    <b-form-radio v-for="option in question.options" :key="option.id" :value="option">{{
                            option.text
                        }}</b-form-radio>
                </b-form-radio-group>

                <!-- CHECKBOX QUESTION -->
                <b-form-checkbox-group
                    v-if="question.type === 'checkbox'"
                    v-model="answers[question.id].answer"
                    @input=";(answers[question.id].changed = true), (questionIndex = index)"
                    stacked
                    required
                    :disabled="review.submitted || reviewsAreReadOnly"
                >
                    <b-form-checkbox v-for="option in question.options" :key="option.id" :value="option">
                        {{ option.text }}</b-form-checkbox
                    >
                </b-form-checkbox-group>

                <!-- RANGE QUESTION -->
                <StarRating
                    v-if="question.type === 'range'"
                    v-model="answers[question.id].answer"
                    @rating-selected=";(answers[question.id].changed = true), (questionIndex = index)"
                    class="align-middle"
                    :border-color="'#007bff'"
                    :active-color="'#007bff'"
                    :border-width="2"
                    :item-size="20"
                    :spacing="5"
                    inline
                    :max-rating="question.range"
                    :show-rating="true"
                    :read-only="review.submitted || reviewsAreReadOnly"
                />

                <!-- UPLOAD QUESTION -->
                <b-form-group v-if="question.type === 'upload'" class="mb-0">
                    <b-row v-if="answers[question.id].answer">
                        <b-col>
                            <!--Show whether file has been uploaded-->
                            <b-alert show variant="success" class="p-2"
                                >File uploaded:
                                <a :href="uploadAnswerFilePath(review.id, question.id)">
                                    {{ answers[question.id].answer.name }}{{ answers[question.id].answer.extension }}
                                </a>
                            </b-alert>
                        </b-col>
                        <b-col>
                            <b-button
                                v-if="answers[question.id].answer.extension === '.pdf'"
                                v-b-modal="`showPDF-${review.id}-${question.id}`"
                            >
                                Show PDF
                            </b-button>
                            <b-modal
                                :id="`showPDF-${review.id}-${question.id}`"
                                title="PDF"
                                size="xl"
                                centered
                                hide-footer
                            >
                                <!-- TODO: What to do with the upload questions? -->
                                <PDFViewer :fileUrl="uploadAnswerFilePath(review.id, question.id)" />
                            </b-modal>
                        </b-col>
                    </b-row>
                    <!--Show note if a file has been uploaded and review not submitted-->
                    <b-alert v-if="answers[question.id].answer" show variant="secondary" class="p-2"
                        >Note: uploading a new file will overwrite your current file. <br />
                        Allowed file types: {{ question.extensions }}
                    </b-alert>
                    <b-alert v-else show variant="warning" class="p-2">
                        Currently, no file has been uploaded. <br />
                        Allowed file types: {{ question.extensions }}
                    </b-alert>
                    <b-form-file
                        placeholder="Choose a new file..."
                        v-model="answers[question.id].newAnswer"
                        :state="Boolean(answers[question.id].newAnswer)"
                        @input="
                            ;(answers[question.id].changed = Boolean(answers[question.id].newAnswer)),
                                (questionIndex = index)
                        "
                        :accept="`${question.extensions}`"
                        :disabled="review.submitted || reviewsAreReadOnly"
                    >
                    </b-form-file>
                </b-form-group>

                <br />
                <!--Delete / Save Button-->
                <b-button
                    :variant="(answers[question.id].exists ? 'danger' : 'outline-danger') + ' float-right'"
                    :disabled="!answers[question.id].exists || review.submitted || buttonDisabled"
                    v-b-modal="`deleteAnswer-${question.id}`"
                    >Delete Answer</b-button
                >
                <b-modal
                    :id="`deleteAnswer-${question.id}`"
                    centered
                    title="Warning"
                    @ok="deleteAnswer(question, answers[question.id])"
                >
                    <div>Are you sure you want to delete this answer?</div>
                </b-modal>
                <b-button
                    ref="saveButton"
                    :variant="(answers[question.id].changed ? 'primary' : 'outline-primary') + ' float-right'"
                    :disabled="!answers[question.id].changed || review.submitted || buttonDisabled"
                    @click="saveAnswer(question, answers[question.id])"
                    >Save Answer</b-button
                >
            </b-card-body>
        </b-card>
        <b-card v-if="!reviewsAreReadOnly">
            <!--Save/Submit Buttons-->
            <b-card-body>
                <div>
                    <b-form-checkbox
                        :disabled="review.submitted"
                        v-model="review.flaggedByReviewer"
                        name="reportButton"
                        class="float-left"
                    >
                        ⚠️ Report this submission
                    </b-form-checkbox>
                    <br />
                    <small> Report the submission if it is empty, not serious or for the wrong assignment. </small>
                </div>
                <b-button
                    v-if="!review.submitted"
                    variant="success float-right"
                    type="submit"
                    v-b-modal="`submit${review.id}`"
                    :disabled="buttonDisabled"
                    >Submit Review</b-button
                >
                <b-button
                    v-else
                    variant="outline-success float-right"
                    v-b-modal="`unsubmit${review.id}`"
                    :disabled="buttonDisabled"
                    >Unsubmit Review</b-button
                >
                <b-button
                    v-if="questionNumbersOfUnsavedAnswers.length > 0"
                    variant="info float-right"
                    @click="saveAllAnswers"
                    :disabled="buttonDisabled"
                    >Save all unsaved answers</b-button
                >
            </b-card-body>
        </b-card>
    </b-card>
    <b-card v-else class="mt-3" style="padding: 1.25rem">No questions present.</b-card>
</template>

<script>
import api from "@/api/api"
import _ from "lodash"
import MarkdownEditorViewer from "../../general/MarkdownEditorViewer"
import PDFViewer from "../../general/PDFViewer"
import { StarRating } from "vue-rate-it"

export default {
    name: "ReviewQuestions",
    components: { MarkdownEditorViewer, PDFViewer, StarRating },
    props: ["questionnaire", "review", "reviewsAreReadOnly", "buttonDisabled", "reviewId"],
    emits: ["disableButton"],
    async created() {
        window.addEventListener("keydown", this.keyDown)
        window.addEventListener("keyup", this.keyUp)
    },
    destroyed() {
        window.removeEventListener("keydown", this.keyDown)
        window.removeEventListener("keyup", this.keyUp)
    },
    data() {
        return {
            // all answers will be saved in this object
            answers: null,
            // Currently pressed keys
            keys: { Enter: false, ControlLeft: false, ControlRight: false },
            // Index of currently active question
            questionIndex: null,
            loadedQuestions: false,
        }
    },
    watch: {
        questionnaire(newQ) {
            if (!this.loadedQuestions && newQ !== undefined) {
                this.loadedQuestions = true
                this.fetchAnswers()
            }
        },
    },
    computed: {
        questionNumbersOfUnsavedAnswers() {
            const questionNumbersOfUnsavedAnswers = []
            if (!this.answers) {
                return questionNumbersOfUnsavedAnswers
            }
            for (const questionId in this.answers) {
                const answer = this.answers[questionId]
                if (answer.changed) {
                    const question = this.getQuestion(questionId)
                    questionNumbersOfUnsavedAnswers.push(question.number)
                }
            }
            questionNumbersOfUnsavedAnswers.sort()
            return questionNumbersOfUnsavedAnswers
        },
        questionNumbersOfUnansweredNonOptionalQuestions() {
            const questionNumbersOfUnansweredNonOptionalQuestions = []
            if (!this.answers) {
                return questionNumbersOfUnansweredNonOptionalQuestions
            }
            for (const questionId in this.answers) {
                const answer = this.answers[questionId]
                const question = this.getQuestion(questionId)
                if (!answer.exists && !question.optional) {
                    questionNumbersOfUnansweredNonOptionalQuestions.push(question.number)
                }
            }
            questionNumbersOfUnansweredNonOptionalQuestions.sort()
            return questionNumbersOfUnansweredNonOptionalQuestions
        },
    },
    methods: {
        uploadAnswerFilePath(reviewId, questionId) {
            return `/api/uploadquestionanswers/file?reviewId=${reviewId}&questionId=${questionId}`
        },
        async fetchAnswers() {
            // remove existing answers
            this.answers = null
            const res = await api.reviewofsubmissions.getAnswers(this.reviewId)
            const existingAnswers = res.data
            // construct answer map
            const answers = {}
            for (const question of this.questionnaire.questions) {
                // answer variable which gets replaced if an answer is present
                let answer = null
                // find existing answer
                const existingAnswer = _.find(existingAnswers, (answer) => {
                    return answer.questionId === question.id
                })
                const answerExists = existingAnswer !== undefined
                if (existingAnswer) {
                    // get the right field from the answer
                    switch (question.type) {
                        case "open":
                            answer = existingAnswer.openAnswer
                            break
                        case "multiplechoice":
                            answer = existingAnswer.multipleChoiceAnswer
                            break
                        case "checkbox":
                            answer = existingAnswer.checkboxAnswer
                            break
                        case "range":
                            answer = existingAnswer.rangeAnswer
                            break
                        case "upload":
                            answer = existingAnswer.uploadAnswer
                            break
                        default:
                            return this.showErrorMessage({ message: "Invalid question" })
                    }
                }
                if (question.type === "upload") {
                    // set new answer to null so it can be used for upload
                    answers[question.id] = { answer: answer, newAnswer: null, exists: answerExists, changed: false }
                } else if (question.type === "checkbox" && !answer) {
                    // set the answer object as changed/empty list as this can be saved directly as well
                    answers[question.id] = { answer: [], exists: answerExists, changed: true }
                } else {
                    answers[question.id] = { answer: answer, exists: answerExists, changed: false }
                }
            }
            // set the answer object so all fields are reactive now
            this.answers = answers
        },
        keyDown(e) {
            this.keys[e.code] = true
            if (this.keys["Enter"] && (this.keys["ControlLeft"] || this.keys["ControlRight"])) {
                const saveButton = this.$refs.saveButton[this.questionIndex]
                saveButton.click()
            }
        },
        keyUp(e) {
            this.keys[e.code] = false
        },
        async saveAnswer(question, answer) {
            this.$emit("disableButton", true)
            try {
                switch (question.type) {
                    case "open":
                        await api.openquestionanswers.post(question.id, this.review.id, answer.answer)
                        break
                    case "multiplechoice":
                        await api.multiplechoicequestionanswers.post(question.id, this.review.id, answer.answer.id)
                        break
                    case "checkbox":
                        await api.checkboxquestionanswers.post(question.id, this.review.id, _.map(answer.answer, "id"))
                        break
                    case "range":
                        await api.rangequestionanswers.post(question.id, this.review.id, answer.answer)
                        break
                    case "upload":
                        // set the answer after upload is succesful
                        answer.answer = (
                            await api.uploadquestionanswers.post(question.id, this.review.id, answer.newAnswer)
                        ).data.uploadAnswer
                        answer.newAnswer = null
                        break
                    default:
                        throw new Error("Invalid question")
                }
                // reset changed boolean
                answer.changed = false
                // set boolean so the answer is present in the database
                answer.exists = true
                this.showSuccessMessage({ message: "Succesfuly saved answer" })
            } catch (error) {
                this.showErrorMessage({ message: error })
            }
            this.$emit("disableButton", false)
        },
        async deleteAnswer(question, answer) {
            this.$emit("disableButton", true)
            try {
                switch (question.type) {
                    case "open":
                        await api.openquestionanswers.delete(question.id, this.review.id)
                        answer.answer = ""
                        break
                    case "multiplechoice":
                        await api.multiplechoicequestionanswers.delete(question.id, this.review.id)
                        break
                    case "checkbox":
                        await api.checkboxquestionanswers.delete(question.id, this.review.id)
                        break
                    case "range":
                        await api.rangequestionanswers.delete(question.id, this.review.id)
                        break
                    case "upload":
                        await api.uploadquestionanswers.delete(question.id, this.review.id)
                        answer.newAnswer = null
                        break
                    default:
                        throw new Error("Invalid question")
                }
                // reset answer
                if (question.type === "checkbox") {
                    answer.answer = []
                } else if (question.type === "open") {
                    answer.answer = ""
                } else {
                    answer.answer = null
                }
                // reset changed boolean
                answer.changed = false
                // set boolean so the answer is not present in the database
                answer.exists = false
                this.showSuccessMessage({ message: "Succesfuly deleted answer" })
            } catch (error) {
                this.showErrorMessage({ message: error })
            }
            this.$emit("disableButton", false)
        },
        async saveAllAnswers() {
            this.$emit("disableButton", true)
            for (const questionId in this.answers) {
                const answer = this.answers[questionId]
                if (answer.changed) {
                    const question = this.getQuestion(questionId)
                    try {
                        await this.saveAnswer(question, answer)
                    } finally {
                        // saving answer enables the button, so it will be disabled again
                        this.$emit("disableButton", true)
                    }
                }
            }
            this.$emit("disableButton", false)
        },
    },
}
</script>

<style scoped></style>
