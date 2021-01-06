<template>
    <div>
        <b-row>
            <!--Download-->
            <b-col cols="6">
                <div>
                    <dl>
                        <dt>Download</dt>
                        <dd>The download for the submission this review is about.</dd>
                        <a target="_blank" :href="reviewFilePath">
                            <button type="button" class="btn btn-success success w-100" style="height: 3rem">
                                Download Submission ({{ reviewFileName }})
                            </button>
                        </a>
                    </dl>
                </div>
            </b-col>

            <!--Approval-->
            <b-col cols="6">
                <dl>
                    <dt>Current submission status</dt>
                    <dd>{{ review.submitted ? "" : "Not " }}Submitted</dd>
                </dl>
                <dl>
                    <dt>Current report status</dt>
                    <dd>{{ review.flaggedByReviewer ? "" : "Not " }}Reported as insufficient</dd>
                </dl>
                <dl v-if="review.submitted">
                    <dt>Current approval status</dt>
                    <dd v-if="review.approvalByTA">Approved 👍</dd>
                    <dd v-if="review.approvalByTA === false">Disapproved 👎</dd>
                    <dd v-if="review.approvalByTA === null">No action yet by any TA.</dd>
                    <dt>Current TA Comment</dt>
                    <dd>{{ review.commentByTA }}</dd>
                </dl>
            </b-col>
        </b-row>

        <!--See Review Evaluation is exist-->
        <b-row v-if="reviewEvaluation">
            <b-col>
                <b-button v-b-modal="`reviewModal${review.id}`" variant="warning" class="w-100" style="height: 3rem"
                    >Show Review Evaluation</b-button
                >
                <b-modal :title="`Review (ID: ${review.id})`" :id="`reviewModal${review.id}`" size="lg" hide-footer>
                    <ReviewEvaluation :feedbackReviewId="reviewId" :reviewsAreReadOnly="true"></ReviewEvaluation>
                </b-modal>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <PDFAnnotator
                    v-if="viewPDF && fileMetadata.extension === '.pdf'"
                    :reviewId="review.id"
                    :readOnly="reviewsAreReadOnly"
                ></PDFAnnotator>
            </b-col>
            <b-col>
                <template v-if="!reviewsAreReadOnly">
                    <!--Save/Submit Buttons-->
                    <b-card-body>
                        <div>
                            <b-form-checkbox
                                :disabled="review.submitted"
                                v-model="review.flaggedByReviewer"
                                name="reportButton"
                                class="float-left"
                            >
                                Report this submission.
                            </b-form-checkbox>
                            <br />
                            <small>Only report if the submission is empty or not serious.</small>
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
                            @click="unSubmitReview"
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
                </template>
                <br />

                <!--Form, load only when answers are available-->
                <b-card v-if="answers" no-body class="mt-3">
                    <!--Title-->
                    <b-card-body v-if="!reviewsAreReadOnly">
                        <h4>Assignment Questionnaire</h4>
                        <h6 class="card-subtitle text-muted">Give the review to one of your peers here.</h6>
                    </b-card-body>

                    <!--Question Information-->
                    <b-card v-for="question in questionnaire.questions" :key="question.id" class="mb-3" no-body>
                        <b-card-header class="d-flex align-items-center">
                            <span class="w-100"
                                >Question {{ question.number }} of {{ questionnaire.questions.length }}</span
                            >
                            <b-badge variant="primary" class="ml-2 float-right p-1"
                                >{{ question.type.toUpperCase() }} QUESTION
                            </b-badge>
                            <b-badge pill v-if="question.optional" variant="secondary" class="ml-2 float-right p-1">
                                OPTIONAL
                            </b-badge>
                            <b-badge v-else variant="danger" class="ml-2 float-right p-1">
                                REQUIRED
                            </b-badge>
                        </b-card-header>

                        <b-card-body>
                            <!-- Text-->
                            <h4>{{ question.text }}</h4>

                            <!-- OPEN QUESTION -->
                            <b-form-textarea
                                v-if="question.type === 'open'"
                                placeholder="Enter your answer"
                                :rows="10"
                                :max-rows="15"
                                v-model="answers[question.id].answer"
                                @input="answers[question.id].changed = true"
                                :readonly="review.submitted || reviewsAreReadOnly"
                                required
                            />

                            <!-- MULTIPLE CHOICE QUESTION -->
                            <b-form-radio-group
                                v-if="question.type === 'multiplechoice'"
                                v-model="answers[question.id].answer"
                                @input="
                                    answers[question.id].answer !== null ? (answers[question.id].changed = true) : ''
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
                                @input="answers[question.id].changed = true"
                                stacked
                                required
                                :disabled="review.submitted || reviewsAreReadOnly"
                            >
                                <b-form-checkbox v-for="option in question.options" :key="option.id" :value="option">{{
                                    option.text
                                }}</b-form-checkbox>
                            </b-form-checkbox-group>

                            <!-- RANGE QUESTION -->
                            <StarRating
                                v-if="question.type === 'range'"
                                v-model="answers[question.id].answer"
                                @rating-selected="answers[question.id].changed = true"
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
                                                {{ answers[question.id].answer.name
                                                }}{{ answers[question.id].answer.extension }}
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
                                    @input="answers[question.id].changed = Boolean(answers[question.id].newAnswer)"
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
                                @click="deleteAnswer(question, answers[question.id])"
                                >Delete Answer</b-button
                            >
                            <b-button
                                :variant="
                                    (answers[question.id].changed ? 'primary' : 'outline-primary') + ' float-right'
                                "
                                :disabled="!answers[question.id].changed || review.submitted || buttonDisabled"
                                @click="saveAnswer(question, answers[question.id])"
                                >Save Answer</b-button
                            >
                        </b-card-body>
                    </b-card>

                    <template v-if="!reviewsAreReadOnly">
                        <!--Save/Submit Buttons-->
                        <b-card-body>
                            <div>
                                <b-form-checkbox
                                    :disabled="review.submitted"
                                    v-model="review.flaggedByReviewer"
                                    name="reportButton"
                                    class="float-left"
                                >
                                    Report this submission.
                                </b-form-checkbox>
                                <br />
                                <small>Only report if the submission is empty or not serious.</small>
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
                                @click="unSubmitReview"
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
                            <!--Submit Modal-->
                            <b-modal
                                :id="`submit${review.id}`"
                                title="Submit Confirmation"
                                :ok-disabled="
                                    buttonDisabled ||
                                        (questionNumbersOfUnansweredNonOptionalQuestions.length > 0 &&
                                            !review.flaggedByReviewer)
                                "
                                @ok="submitReview"
                            >
                                <b-alert
                                    v-if="questionNumbersOfUnsavedAnswers.length > 0"
                                    show
                                    variant="warning"
                                    class="p-2"
                                    >There are one or more unsaved answers for the following questions:
                                    {{ questionNumbersOfUnsavedAnswers }}</b-alert
                                >
                                <b-alert
                                    v-if="questionNumbersOfUnansweredNonOptionalQuestions.length > 0"
                                    show
                                    variant="danger"
                                    class="p-2"
                                    >There are one or more answers missing for the following non-optional questions:
                                    {{ questionNumbersOfUnansweredNonOptionalQuestions }}</b-alert
                                >
                                Do you really want to submit? This marks the review as finished and all unsaved changes
                                will be discarded.
                            </b-modal>
                        </b-card-body>
                    </template>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import api from "../../../api/api"
import _ from "lodash"
import notifications from "../../../mixins/notifications"
import { StarRating } from "vue-rate-it"
import ReviewEvaluation from "./ReviewEvaluation"
import PDFAnnotator from "./PDFAnnotator"
import PDFViewer from "../../general/PDFViewer"

export default {
    mixins: [notifications],
    components: { StarRating, ReviewEvaluation, PDFAnnotator, PDFViewer },
    props: ["reviewId", "reviewsAreReadOnly"],
    data() {
        return {
            fileMetadata: null,
            review: {},
            // dont view pdf until data is fetched
            viewPDF: false,
            reviewEvaluation: null,
            questionnaire: {},
            // all answers will be saved in this object
            answers: null,
            // disable save/delete buttons when a call is busy
            buttonDisabled: false
        }
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
        reviewFilePath() {
            // Get the submission file path.
            return `/api/reviewofsubmissions/${this.review.id}/file`
        },
        reviewFileName() {
            if (this.fileMetadata) {
                return this.fileMetadata.name + this.fileMetadata.extension
            } else {
                return ""
            }
        }
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            this.viewPDF = false
            await this.fetchReview()
            await this.fetchFileMetadata()
            this.viewPDF = true
            await this.fetchSubmissionQuestionnaire()
            await this.fetchAnswers()
            await this.fetchReviewEvaluation()
        },
        async fetchFileMetadata() {
            const res = await api.reviewofsubmissions.getFileMetadata(this.reviewId)
            this.fileMetadata = res.data
        },
        async fetchReview() {
            const res = await api.reviewofsubmissions.get(this.reviewId)
            this.review = res.data
        },
        async fetchReviewEvaluation() {
            // Retrieve the review evaluation.
            try {
                const res = await api.reviewofsubmissions.getEvaluation(this.reviewId)
                this.reviewEvaluation = res.data
            } catch (error) {
                this.reviewEvaluation = null
            }
        },
        async fetchSubmissionQuestionnaire() {
            const res = await api.submissionquestionnaires.get(this.review.questionnaireId)
            this.questionnaire = res.data
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
                const existingAnswer = _.find(existingAnswers, answer => {
                    return answer.questionId === question.id
                })
                const answerExists = existingAnswer ? true : false
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
        getQuestion(questionId) {
            return _.find(this.questionnaire.questions, question => {
                return question.id === parseInt(questionId)
            })
        },
        async saveAnswer(question, answer) {
            this.buttonDisabled = true
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
            this.buttonDisabled = false
        },
        async deleteAnswer(question, answer) {
            this.buttonDisabled = true
            try {
                switch (question.type) {
                    case "open":
                        await api.openquestionanswers.delete(question.id, this.review.id)
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
            this.buttonDisabled = false
        },
        async saveAllAnswers() {
            this.buttonDisabled = true
            for (const questionId in this.answers) {
                const answer = this.answers[questionId]
                if (answer.changed) {
                    const question = this.getQuestion(questionId)
                    try {
                        await this.saveAnswer(question, answer)
                    } finally {
                        // saving answer enables the button, so it will be disabled again
                        this.buttonDisabled = true
                    }
                }
            }
            this.buttonDisabled = false
        },
        async submitReview() {
            this.buttonDisabled = true
            try {
                await api.reviewofsubmissions.patch(this.review.id, true, this.review.flaggedByReviewer)
                this.$emit("reviewChanged")
                this.showSubmitMessage()
                await this.fetchData()
            } finally {
                this.buttonDisabled = false
            }
        },
        async unSubmitReview() {
            this.buttonDisabled = true
            try {
                await api.reviewofsubmissions.patch(this.review.id, false, this.review.flaggedByReviewer)
                this.$emit("reviewChanged")
                this.showUnSubmitMessage()
                await this.fetchData()
            } finally {
                this.buttonDisabled = false
            }
        },
        uploadAnswerFilePath(reviewId, questionId) {
            return `/api/uploadquestionanswers/file?reviewId=${reviewId}&questionId=${questionId}`
        }
    }
}
</script>
