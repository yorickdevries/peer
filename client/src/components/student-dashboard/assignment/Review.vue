<template>
    <div>
        <b-button id="slideout-btn" variant="warning" v-b-toggle.sidebar>
            <p>Show Questions</p>
        </b-button>
        <b-row>
            <!--Download-->
            <b-col cols="6">
                <div>
                    <dl>
                        <dt>Download</dt>
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
                    <dt>Current status</dt>
                    <dd v-if="review.submitted">✅ Feedback submitted</dd>
                    <dd v-else>⚠️ Feedback not submitted</dd>
                </dl>
                <dl>
                    <dt>Current report status</dt>
                    <dd v-if="!review.submitted">-</dd>
                    <dd v-else-if="review.flaggedByReviewer">
                        ⚠️ This submission was reported as empty, not serious or for the wrong assignment
                    </dd>
                    <dd v-else>✅ Not reported</dd>
                </dl>
                <dl v-if="review.submitted">
                    <dt>Current approval status</dt>
                    <dd v-if="review.approvalByTA">👍 Approved</dd>
                    <dd v-if="review.approvalByTA === false">👎 Disapproved</dd>
                    <dd v-if="review.approvalByTA === null">Not checked by TA</dd>
                    <dt v-if="review.commentByTA">Current TA Comment</dt>
                    <b-form-textarea
                        v-if="review.commentByTA"
                        :rows="10"
                        :max-rows="15"
                        v-model="review.commentByTA"
                        readonly
                    />
                </dl>
            </b-col>
        </b-row>

        <!--See Review Evaluation is exist-->
        <b-row v-if="reviewEvaluation && evaluationButton">
            <b-col>
                <b-button v-b-modal="`reviewModal${review.id}`" variant="warning" class="w-100" style="height: 3rem"
                    >Show Review Evaluation</b-button
                >
                <b-modal :title="`Review (ID: ${review.id})`" :id="`reviewModal${review.id}`" size="xl" hide-footer>
                    <ReviewEvaluation :feedbackReviewId="reviewId" :reviewsAreReadOnly="true"></ReviewEvaluation>
                </b-modal>
            </b-col>
        </b-row>
        <br />
        <b-row>
            <b-col :cols="columnWidthFileAndQuestionnaire" v-if="viewFile">
                <br />
                <br />
                <FileAnnotator :reviewId="review.id" :assignmentType="assignmentType" :readOnly="reviewsAreReadOnly" />
            </b-col>
            <b-col :cols="columnWidthFileAndQuestionnaire">
                <b-sidebar id="sidebar" title="Review Questionnaire" width="75%" right shadow backdrop>
                    <!--Form, load only when answers are available-->
                    <ReviewQuestions
                        :reviewsAreReadOnly="reviewsAreReadOnly"
                        :review="review"
                        :questionnaire="questionnaire"
                        @disableButton="(v) => (this.buttonDisabled = v)"
                        ref="questions"
                    ></ReviewQuestions>
                </b-sidebar>

                <template v-if="!reviewsAreReadOnly">
                    <!--Save/Submit Buttons-->
                    <b-card-body>
                        <b-alert show variant="info"
                            >Questions can be accessed by clicking the yellow button on the right.
                        </b-alert>
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
                            <small>
                                Report the submission if it is empty, not serious or for the wrong assignment.
                            </small>
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
                            v-if="this.$refs.questions.questionNumbersOfUnsavedAnswers.length > 0"
                            variant="info float-right"
                            @click="this.$refs.questions.saveAllAnswers"
                            :disabled="buttonDisabled"
                            >Save all unsaved answers</b-button
                        >
                    </b-card-body>
                </template>
            </b-col>

            <!--Submit Modal-->
            <b-modal
                :id="`submit${review.id}`"
                title="Submit Confirmation"
                :ok-disabled="
                    buttonDisabled ||
                    (this.$refs.questions.questionNumbersOfUnansweredNonOptionalQuestions.length > 0 &&
                        !review.flaggedByReviewer)
                "
                @ok="submitReview"
            >
                <b-alert
                    v-if="this.$refs.questions.questionNumbersOfUnsavedAnswers.length > 0"
                    show
                    variant="warning"
                    class="p-2"
                    >There are one or more unsaved answers for the following questions:
                    {{ this.$refs.questions.questionNumbersOfUnsavedAnswers }}</b-alert
                >
                <b-alert
                    v-if="this.$refs.questions.questionNumbersOfUnansweredNonOptionalQuestions.length > 0"
                    show
                    variant="danger"
                    class="p-2"
                    >There are one or more answers missing for the following non-optional questions:
                    {{ this.$refs.questions.questionNumbersOfUnansweredNonOptionalQuestions }}</b-alert
                >
                Do you really want to submit? This marks the review as finished and all unsaved changes will be
                discarded.
            </b-modal>
            <!--Unsubmit Modal-->
            <b-modal
                :id="`unsubmit${review.id}`"
                title="Unsubmit Confirmation"
                :ok-disabled="buttonDisabled"
                @ok="unSubmitReview"
            >
                Do you really want to unsubmit? Your answers will be kept, but your review will not count until you
                resubmit it.
            </b-modal>
        </b-row>
    </div>
</template>

<style>
#slideout-btn {
    position: fixed;
    transform: rotate(-90deg);
    bottom: calc(50% - 40px);
    right: -100px;
    height: 80px;
    width: 200px;
    z-index: 999;
    border-radius: 30px 30px 0 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    transition: right 0.5s;
}
#slideout-btn:hover {
    right: -80px;
    transition: right 0.5s;
}
</style>

<script>
import api from "../../../api/api"
import _ from "lodash"
import notifications from "../../../mixins/notifications"
import ReviewEvaluation from "./ReviewEvaluation"
import FileAnnotator from "./FileAnnotator"
import ReviewQuestions from "@/components/student-dashboard/assignment/ReviewQuestions.vue"

export default {
    mixins: [notifications],
    name: "Review",
    components: { ReviewQuestions, ReviewEvaluation, FileAnnotator },
    props: ["reviewId", "reviewsAreReadOnly", "assignmentType", "evaluationButton"],
    data() {
        return {
            fileMetadata: null,
            review: {},
            // dont view file until data is fetched
            viewFile: false,
            reviewEvaluation: null,
            questionnaire: {},
            // disable save/delete buttons when a call is busy
            buttonDisabled: false,
            // View file next to questionnaire
            viewFileNextToQuestionnaire: false,
        }
    },
    computed: {
        columnWidthFileAndQuestionnaire() {
            if (this.viewFileNextToQuestionnaire) {
                // columns are half width
                return 6
            } else {
                // columns are full width
                return 12
            }
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
        },
    },
    async created() {
        await this.fetchData()
    },
    mounted() {
        /*
        setTimeout(() => {
            document.querySelector("#slideout-btn").animate(
                { right: ["-100px", "-80px", "-100px", "-80px", "-100px"] },
                {
                    duration: 3000,
                    iterations: 1,
                    easing: "ease",
                }
            )
        }, 2000)
        */
    },
    methods: {
        async fetchData() {
            this.viewFile = false
            await this.fetchReview()
            await this.fetchFileMetadata()
            this.viewFile = true
            await this.fetchSubmissionQuestionnaire()
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
                const res = await api.reviewofsubmissions.getEvaluation(this.reviewId, true)
                this.reviewEvaluation = res.data
            } catch (error) {
                this.reviewEvaluation = null
            }
        },
        async fetchSubmissionQuestionnaire() {
            const res = await api.submissionquestionnaires.get(this.review.questionnaireId)
            this.questionnaire = res.data
        },
        getQuestion(questionId) {
            return _.find(this.questionnaire.questions, (question) => {
                return question.id === parseInt(questionId)
            })
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
        toggleViewFileNextToQuestionnaire() {
            this.viewFileNextToQuestionnaire = !this.viewFileNextToQuestionnaire
        },
    },
}
</script>
