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
                    size="xl"
                    hide-footer
                >
                    <b-alert variant="info" show>
                        This is a review you have received from one of your peers on your submission.
                    </b-alert>
                    <Review
                        :reviewId="feedbackReviewId"
                        :reviewsAreReadOnly="true"
                        :assignmentType="assignmentType"
                        :evaluationButton="false"
                        :popup="true"
                    >
                    </Review>
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
                    <b-button
                        @click="createEvaluation()"
                        variant="primary"
                        class="mt-2"
                        :disabled="buttonDisabled || reviewsAreReadOnly"
                    >
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
            <b-alert v-if="review.submitted" variant="success" show> This evaluation has been submitted. </b-alert>
            <b-alert v-else variant="danger" show> This evaluation has not yet been submitted. </b-alert>
        </div>

        <b-row v-if="review">
            <!--Download-->
            <b-col cols="6" />
            <!--Approval-->
            <b-col cols="6">
                <dl>
                    <dt>Current status</dt>
                    <dd v-if="review.submitted">✅ Evaluation submitted</dd>
                    <dd v-else>⚠️ Evaluation not submitted</dd>
                </dl>
                <dl>
                    <dt>Current report status</dt>
                    <dd v-if="!review.submitted">-</dd>
                    <dd v-else-if="review.flaggedByReviewer">⚠️ This review was reported as empty or not serious</dd>
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

        <template v-if="userIsOwner && !reviewsAreReadOnly">
            <!--Save/Submit Buttons-->
            <b-card-body>
                <div>
                    <b-form-checkbox
                        :disabled="review.submitted"
                        v-model="review.flaggedByReviewer"
                        name="reportButton"
                        class="float-left"
                    >
                        ⚠️ Report the review
                    </b-form-checkbox>
                    <br />
                    <small>Report the review if it is empty or not serious.</small>
                </div>
                <b-button
                    v-if="!review.submitted"
                    variant="success float-right"
                    type="submit"
                    v-b-modal="`submit${review.id}`"
                    :disabled="buttonDisabled"
                    >Submit Evaluation</b-button
                >
                <b-button
                    v-else
                    variant="outline-success float-right"
                    v-b-modal="`unsubmit${review.id}`"
                    :disabled="buttonDisabled"
                    >Unsubmit Evaluation</b-button
                >
                <b-button
                    v-if="unsavedAnswer.length > 0"
                    variant="info float-right"
                    @click="saveAllAnswers"
                    :disabled="buttonDisabled"
                    >Save all unsaved answers</b-button
                >
            </b-card-body>
        </template>
        <br />

        <!--Form, load only when answers are available-->
        <b-card v-if="readyLoadAnswers" no-body class="mt-3">
            <!--Title-->
            <b-card-header v-if="userIsOwner && !reviewsAreReadOnly">
                <h4>Review Evaluation</h4>
                <h6 class="card-subtitle text-muted">
                    Evaluate the review you have gotten from one of your peers here.
                </h6>
            </b-card-header>

            <!--Question Information-->
            <ReviewQuestions
                :reviewsAreReadOnly="reviewsAreReadOnly || !userIsOwner"
                :review="review"
                :questionnaire="questionnaire"
                :buttonDisabled="buttonDisabled"
                :feedback="true"
                :canChange="questionsCanBeChanged"
                ref="questions"
                @disableButton="(v) => (buttonDisabled = v)"
                @unsaveAns="(v) => (unsavedAnswer = v)"
                @unansQues="(v) => (unansweredQuestion = v)"
                style="padding: 1.25rem"
            ></ReviewQuestions>

            <template v-if="userIsOwner && !reviewsAreReadOnly">
                <!--Save/Submit Buttons-->
                <b-card-body>
                    <div>
                        <b-form-checkbox
                            :disabled="review.submitted"
                            v-model="review.flaggedByReviewer"
                            name="reportButton"
                            class="float-left"
                        >
                            ⚠️ Report the review
                        </b-form-checkbox>
                        <br />
                        <small>Report the review if it is empty or not serious.</small>
                    </div>
                    <b-button
                        v-if="!review.submitted"
                        variant="success float-right"
                        type="submit"
                        v-b-modal="`submit${review.id}`"
                        :disabled="buttonDisabled"
                        >Submit Evaluation</b-button
                    >
                    <b-button
                        v-else
                        variant="outline-success float-right"
                        v-b-modal="`unsubmit${review.id}`"
                        :disabled="buttonDisabled"
                        >Unsubmit Evaluation</b-button
                    >
                    <b-button
                        v-if="unsavedAnswer.length > 0"
                        variant="info float-right"
                        @click="saveAllAnswers"
                        :disabled="buttonDisabled"
                        >Save all unsaved answers</b-button
                    >
                    <!--Submit Modal-->
                    <b-modal
                        :id="`submit${review.id}`"
                        title="Submit Confirmation"
                        :ok-disabled="buttonDisabled || (unansweredQuestion.length > 0 && !review.flaggedByReviewer)"
                        @ok="submitReview"
                    >
                        <b-alert v-if="unsavedAnswer.length > 0" show variant="warning" class="p-2"
                            >There are one or more unsaved answers for the following questions:
                            {{ unsavedAnswer }}</b-alert
                        >
                        <b-alert v-if="unansweredQuestion.length > 0" show variant="danger" class="p-2"
                            >There are one or more answers missing for the following non-optional questions:
                            {{ unansweredQuestion }}</b-alert
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
                        Do you really want to unsubmit? Your answers will be kept, but your evaluation will not count
                        until you resubmit it.
                    </b-modal>
                </b-card-body>
            </template>
        </b-card>
    </div>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"
import Review from "./Review.vue"
import ReviewQuestions from "@/components/student-dashboard/assignment/ReviewQuestions.vue"

export default {
    mixins: [notifications],
    name: "ReviewEvaluation",
    components: { ReviewQuestions, Review },
    props: ["feedbackReviewId", "reviewsAreReadOnly", "assignmentType"],
    data() {
        return {
            // current user
            user: null,
            // review made as evaluation
            review: null,
            questionnaire: null,
            // disable save/delete buttons when a call is busy
            buttonDisabled: false,
            unsavedAnswer: [],
            unansweredQuestion: [],
        }
    },
    computed: {
        readyLoadAnswers() {
            return this.review && this.questionnaire
        },
        userIsOwner() {
            if (this.review && this.user) {
                return this.review.reviewerNetid === this.user.netid
            } else {
                return false
            }
        },
        questionsCanBeChanged() {
            return !(this.review.submitted || !this.userIsOwner || this.reviewsAreReadOnly)
        },
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
            }
        },
        async fetchUser() {
            let res = await api.getMe()
            this.user = res.data
        },
        async fetchReview() {
            // Retrieve the review evaluation.
            try {
                const res = await api.reviewofsubmissions.getEvaluation(this.feedbackReviewId, true)
                this.review = res.data
            } catch (error) {
                this.review = null
            }
        },
        async fetchReviewQuestionnaire() {
            const res = await api.reviewquestionnaires.get(this.review.questionnaireId)
            this.questionnaire = res.data
        },
        async createEvaluation() {
            this.buttonDisabled = true
            try {
                await api.reviewofsubmissions.postEvaluation(this.feedbackReviewId)
                this.showSuccessMessage({ message: "Succesfully created evaluation" })
                await this.fetchData()
            } finally {
                this.buttonDisabled = false
            }
        },
        saveAllAnswers() {
            this.$refs.questions ? this.$refs.questions.saveAllAnswers() : null
        },
        async submitReview() {
            this.buttonDisabled = true
            try {
                await api.reviewofreviews.patch(this.review.id, true, this.review.flaggedByReviewer)
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
                await api.reviewofreviews.patch(this.review.id, false, this.review.flaggedByReviewer)
                this.$emit("reviewChanged")
                this.showUnSubmitMessage()
                await this.fetchData()
            } finally {
                this.buttonDisabled = false
            }
        },
    },
}
</script>
