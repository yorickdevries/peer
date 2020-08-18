<template>
    <div>
        <!--See Review-->
        <b-row>
            <b-col>
                <b-button
                    v-b-modal="`reviewModal${feedbackReviewId}`"
                    variant="success"
                    class="w-100"
                    style="height: 3rem"
                >
                    Show Review (ID: {{ feedbackReviewId }})
                </b-button>
                <b-modal
                    :title="`Review (ID: ${feedbackReviewId})`"
                    :id="`reviewModal${feedbackReviewId}`"
                    size="lg"
                    hide-footer
                >
                    <b-alert variant="info" show>
                        This is a review you have received from one of your peers on your submission.
                    </b-alert>
                    <Review :reviewId="feedbackReviewId" :reviewsAreReadOnly="true"></Review>
                </b-modal>
            </b-col>
        </b-row>
        <br />

        <!--Button/info if no evaluation exists yet.-->
        <div v-if="!review">
            <b-alert show variant="info">
                You can give an evaluation of a review that you have received by clicking the button down below.
                <br />
                <b>Note: Only one member of your group can evaluate this review.</b>
                <div>
                    <b-button @click="createEvaluation()" variant="primary" class="mt-2">
                        I want to evaluate this review
                    </b-button>
                </div>
            </b-alert>
        </div>
        <div v-else>
            <!--Notification if owner-->
            <b-alert v-if="userIsOwner" variant="secondary" show>
                You are the owner of this evaluation. You can change or submit this evaluation.
            </b-alert>
            <b-alert v-else variant="secondary" show>
                Another group member ({{ review.reviewerNetid }}) is the owner of this evaluation. Only they can change
                or submit this evaluation.
            </b-alert>
            <!--Notification if submitted-->
            <b-alert v-if="review.submitted" variant="success" show>
                This evaluation has been submitted.
            </b-alert>
            <b-alert v-else variant="danger" show>
                This evaluation has not yet been submitted.
            </b-alert>
        </div>

        <b-row v-if="review">
            <!--Download-->
            <b-col cols="6" />
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
                </dl>
            </b-col>
        </b-row>

        <!--Form, load only when answers are available-->
        <b-card v-if="answers" no-body class="mt-3">
            <!--Title-->
            <b-card-body v-if="!reviewsAreReadOnly">
                <h4>Review Evaluation</h4>
                <h6 class="card-subtitle text-muted">
                    Evaluate the review you have gotten from one of your peers here.
                </h6>
            </b-card-body>

            <!--Question Information-->
            <b-card v-for="question in questionnaire.questions" :key="question.id" class="mb-3" no-body>
                <b-card-header class="d-flex align-items-center">
                    <span class="w-100">Question {{ question.number }} of {{ questionnaire.questions.length }}</span>
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
                        @input="answers[question.id].changed = true"
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
                        <!--Show whether file has been uploaded-->
                        <b-alert v-if="answers[question.id].answer" show variant="success" class="p-2"
                            >File uploaded:
                            <a :href="uploadAnswerFilePath(review.id, question.id)">
                                {{ answers[question.id].answer.name }}{{ answers[question.id].answer.extension }}
                            </a>
                        </b-alert>
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

                    <!--Save Button-->
                    <br />
                    <b-button
                        :variant="(answers[question.id].changed ? 'primary' : 'outline-primary') + ' float-right'"
                        :disabled="!answers[question.id].changed"
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
                            Report this review.
                        </b-form-checkbox>
                        <br />
                        <small>Only report if the review is empty or not serious.</small>
                    </div>
                    <b-button
                        v-if="!review.submitted"
                        variant="success float-right"
                        type="submit"
                        v-b-modal="`submit${review.id}`"
                        >Submit Review</b-button
                    >
                    <b-button v-else variant="outline-success float-right" @click="unSubmitReview"
                        >Unsubmit Review</b-button
                    >
                    <!--Submit Modal-->
                    <b-modal :id="`submit${review.id}`" title="Submit Confirmation" @ok="submitReview">
                        Do you really want to submit? This marks the review as finished and all unsaved changes will be
                        discarded.
                    </b-modal>
                </b-card-body>
            </template>
        </b-card>
    </div>
</template>

<script>
import api from "../../../api/api"
import _ from "lodash"
import notifications from "../../../mixins/notifications"
import { StarRating } from "vue-rate-it"
import Review from "./Review"

export default {
    mixins: [notifications],
    components: { Review, StarRating },
    props: ["feedbackReviewId"],
    data() {
        return {
            // current user
            user: null,
            // review made as evaluation
            review: null,
            questionnaire: null,
            // all answers will be saved in this object
            answers: null
        }
    },
    computed: {
        userIsOwner() {
            return this.review.reviewerNetid === this.user.netid
        },
        reviewsAreReadOnly() {
            return !this.userIsOwner
        }
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            await this.fetchUser()
            await this.fetchReview()
            if (this.review) {
                await this.fetchReviewQuestionnaire()
                await this.fetchAnswers()
            }
        },
        async fetchUser() {
            let res = await api.getMe()
            this.user = res.data
        },
        async fetchReview() {
            // Retrieve the review evaluation.
            try {
                const res = await api.reviewofsubmissions.getEvaluation(this.feedbackReviewId)
                this.review = res.data
            } catch (error) {
                this.review = null
            }
        },
        async fetchReviewQuestionnaire() {
            const res = await api.reviewquestionnaires.get(this.review.questionnaireId)
            this.questionnaire = res.data
        },
        async fetchAnswers() {
            // remove existing answers
            this.answers = null
            const res = await api.reviewofreviews.getAnswers(this.review.id)
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
                    answers[question.id] = { answer: answer, newAnswer: null, changed: false }
                } else if (question.type === "checkbox" && !answer) {
                    // set the answer object as changed/empty list as this can be saved directly as well
                    answers[question.id] = { answer: [], changed: true }
                } else {
                    answers[question.id] = { answer: answer, changed: false }
                }
            }
            // set the answer object so all fields are reactive now
            this.answers = answers
        },
        async createEvaluation() {
            await api.reviewofsubmissions.postEvaluation(this.feedbackReviewId)
            this.showSuccessMessage({ message: "Succesfully created evaluation" })
            await this.fetchData()
        },
        async saveAnswer(question, answer) {
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
                    return this.showErrorMessage({ message: "Invalid question" })
            }
            // reset changed boolean
            answer.changed = false
            this.showSuccessMessage({ message: "Succesfuly saved answer" })
        },
        async submitReview() {
            await api.reviewofreviews.patch(this.review.id, true, this.review.flaggedByReviewer)
            this.showSubmitMessage()
            await this.fetchData()
        },
        async unSubmitReview() {
            await api.reviewofreviews.patch(this.review.id, false, this.review.flaggedByReviewer)
            this.showUnSubmitMessage()
            await this.fetchData()
        },
        uploadAnswerFilePath(reviewId, questionId) {
            return `/api/uploadquestionanswers/file?reviewId=${reviewId}&questionId=${questionId}`
        }
    }
}
</script>
