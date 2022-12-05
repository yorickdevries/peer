<template>
    <div>
        <b-container fluid>
            <!--Header-->
            <BreadcrumbTitle
                :items="['Assignments', assignment.name, 'Reviews', review.id]"
                class="mt-3"
            ></BreadcrumbTitle>

            <!--Next Review-->
            <b-card no-body>
                <b-card-header class="d-flex justify-content-between align-items-center">
                    <div>Review information</div>
                    <div>
                        <b-button size="sm" variant="secondary" @click="$router.back()" class="mr-2"
                            >Back to Assignment</b-button
                        >
                        <b-button size="sm" variant="primary" @click="goToNextReviewWithoutApproval"
                            >Next (Random) Review Without Approval</b-button
                        >
                    </div>
                </b-card-header>
                <b-card-body>
                    <b-row>
                        <!--Download-->
                        <b-col cols="6">
                            <div>
                                <dl>
                                    <dt>Download</dt>
                                    <dd>The download for the submission this review is about.</dd>
                                    <a target="_blank" :href="reviewFilePath">
                                        <button
                                            type="button"
                                            class="btn btn-success success w-100"
                                            style="height: 3rem"
                                        >
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
                                <b-form-textarea :rows="10" :max-rows="15" v-model="review.commentByTA" readonly />
                            </dl>
                        </b-col>
                    </b-row>

                    <!--See Review Evaluation is exist-->
                    <b-row v-if="reviewEvaluation">
                        <b-col>
                            <b-button
                                v-b-modal="`reviewModal${review.id}`"
                                variant="warning"
                                class="w-100"
                                style="height: 3rem"
                                >Show Review Evaluation</b-button
                            >
                            <b-modal
                                :title="`Review (ID: ${review.id})`"
                                :id="`reviewModal${review.id}`"
                                size="xl"
                                hide-footer
                            >
                                <ReviewEvaluation
                                    :feedbackReviewId="review.id"
                                    :reviewsAreReadOnly="true"
                                ></ReviewEvaluation>
                            </b-modal>
                        </b-col>
                    </b-row>
                    <br />
                    <b-row>
                        <b-col :cols="columnWidthFileAndQuestionnaire" v-if="viewFile">
                            <!--Toggle side by side view-->
                            <b-button @click="toggleViewFileNextToQuestionnaire()">
                                {{ viewFileNextToQuestionnaire ? "Stop viewing" : "View" }} submission next to
                                questionnaire
                            </b-button>
                            <br />
                            <br />
                            <FileAnnotator
                                :reviewId="review.id"
                                :assignmentType="assignment.assignmentType"
                                :readOnly="true"
                            />
                        </b-col>
                        <b-col :cols="columnWidthFileAndQuestionnaire">
                            <b-card
                                v-if="answers"
                                no-body
                                class="mt-3"
                                :style="viewFileNextToQuestionnaire ? 'max-height: 1000px; overflow-y: auto' : ''"
                            >
                                <!--Form-->
                                <b-list-group flush>
                                    <!--Question Information-->
                                    <b-card
                                        v-for="question in questionnaire.questions"
                                        :key="question.id"
                                        class="mb-3"
                                        no-body
                                    >
                                        <b-card-header class="d-flex align-items-center">
                                            <span class="w-100"
                                                >Question {{ question.number }} of
                                                {{ questionnaire.questions.length }}</span
                                            >
                                            <b-badge variant="primary" class="ml-2 float-right p-1"
                                                >{{ question.type.toUpperCase() }} QUESTION
                                            </b-badge>
                                            <b-badge
                                                pill
                                                v-if="question.optional"
                                                variant="secondary"
                                                class="ml-2 float-right p-1"
                                            >
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
                                                readonly
                                                required
                                            />

                                            <!-- MULTIPLE CHOICE QUESTION -->
                                            <b-form-radio-group
                                                v-if="question.type === 'multiplechoice'"
                                                v-model="answers[question.id].answer"
                                                stacked
                                                required
                                                disabled
                                            >
                                                <b-form-radio
                                                    v-for="option in question.options"
                                                    :key="option.id"
                                                    :value="option"
                                                    >{{ option.text }}</b-form-radio
                                                >
                                            </b-form-radio-group>

                                            <!-- CHECKBOX QUESTION -->
                                            <b-form-checkbox-group
                                                v-if="question.type === 'checkbox'"
                                                v-model="answers[question.id].answer"
                                                stacked
                                                required
                                                disabled
                                            >
                                                <b-form-checkbox
                                                    v-for="option in question.options"
                                                    :key="option.id"
                                                    :value="option"
                                                    >{{ option.text }}</b-form-checkbox
                                                >
                                            </b-form-checkbox-group>

                                            <!-- RANGE QUESTION -->
                                            <StarRating
                                                v-if="question.type === 'range'"
                                                v-model="answers[question.id].answer"
                                                class="align-middle"
                                                :border-color="'#007bff'"
                                                :active-color="'#007bff'"
                                                :border-width="2"
                                                :item-size="20"
                                                :spacing="5"
                                                inline
                                                :max-rating="question.range"
                                                :show-rating="true"
                                                read-only
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
                                                            <PDFViewer
                                                                :fileUrl="uploadAnswerFilePath(review.id, question.id)"
                                                            />
                                                        </b-modal>
                                                    </b-col>
                                                </b-row>
                                                <!--Show note if a file has been uploaded and review not submitted-->
                                                <b-alert
                                                    v-if="answers[question.id].answer"
                                                    show
                                                    variant="secondary"
                                                    class="p-2"
                                                    >Note: uploading a new file will overwrite your current file. <br />
                                                    Allowed file types: {{ question.extensions }}
                                                </b-alert>
                                                <b-alert v-else show variant="warning" class="p-2">
                                                    Currently, no file has been uploaded. <br />
                                                    Allowed file types: {{ question.extensions }}
                                                </b-alert>
                                                <b-form-file placeholder="Choose a new file..." disabled> </b-form-file>
                                            </b-form-group>
                                        </b-card-body>
                                    </b-card>
                                </b-list-group>
                            </b-card>
                            <b-card v-if="review.submitted" class="mt-3">
                                <!--Approval-->
                                <div>
                                    <dl>
                                        <dt>Current approval status</dt>
                                        <dd v-if="review.approvalByTA">Approved 👍</dd>
                                        <dd v-if="review.approvalByTA === false">Disapproved 👎</dd>
                                        <dd v-if="review.approvalByTA === null">No action yet by any TA.</dd>
                                        <dd>
                                            <b-button
                                                variant="danger"
                                                class="mr-2"
                                                @click="updateReviewApproval(false)"
                                                :disabled="review.approvalByTA === false && !commentChanged"
                                                >Disapprove 👎</b-button
                                            >
                                            <b-button
                                                variant="success"
                                                @click="updateReviewApproval(true)"
                                                :disabled="review.approvalByTA === true && !commentChanged"
                                                >Approve 👍</b-button
                                            >
                                        </dd>
                                    </dl>
                                    <dl>
                                        <b-form-textarea
                                            placeholder="Add an optional comment"
                                            v-model="review.commentByTA"
                                            @input="commentChanged = true"
                                        />
                                    </dl>
                                    <dl>
                                        <b-alert :show="commentChanged" variant="warning"
                                            >Comment changed, please don't forget to set approval to save</b-alert
                                        >
                                    </dl>
                                </div>
                            </b-card>
                            <!--Submission Approval-->
                            <b-card>
                                <div>
                                    <dt>Submission approval</dt>
                                    <!-- note: the name needs to be different for TAs-->
                                    <b-button
                                        variant="primary"
                                        :to="{
                                            name: $router.currentRoute.name.includes('teacher')
                                                ? 'teacher-dashboard.assignments.assignment.submission'
                                                : 'teaching-assistant-dashboard.course.assignment.submission',
                                            params: { submissionId: review.submission.id }
                                        }"
                                        >Show submission approval</b-button
                                    >
                                </div>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-card-body>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api"
import _ from "lodash"
import notifications from "../../mixins/notifications"
import BreadcrumbTitle from "../BreadcrumbTitle"
import { StarRating } from "vue-rate-it"
import ReviewEvaluation from "../student-dashboard/assignment/ReviewEvaluation"
import FileAnnotator from "../student-dashboard/assignment/FileAnnotator"
import PDFViewer from "../general/PDFViewer"

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle, StarRating, ReviewEvaluation, FileAnnotator, PDFViewer },
    data() {
        return {
            assignment: {},
            questionnaire: {},
            fileMetadata: {},
            review: {},
            commentChanged: false,
            // dont view file until data is fetched
            viewFile: false,
            reviewEvaluation: null,
            // all answers will be saved in this object
            answers: null,
            // View file next to questionnaire
            viewFileNextToQuestionnaire: false
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
        }
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            await this.fetchAssignment()
            this.viewFile = false
            await this.fetchReview()
            await this.fetchFileMetadata()
            this.viewFile = true
            await this.fetchSubmissionQuestionnaire()
            await this.fetchAnswers()
            await this.fetchReviewEvaluation()
        },
        async fetchAssignment() {
            // Fetch the assignment information.
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchFileMetadata() {
            const res = await api.reviewofsubmissions.getFileMetadata(this.review.id)
            this.fileMetadata = res.data
        },
        async fetchReview() {
            const res = await api.reviewofsubmissions.get(this.$route.params.reviewId)
            this.review = res.data
            this.commentChanged = false
        },
        async fetchReviewEvaluation() {
            // Retrieve the review evaluation.
            try {
                const res = await api.reviewofsubmissions.getEvaluation(this.$route.params.reviewId)
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
            const res = await api.reviewofsubmissions.getAnswers(this.$route.params.reviewId)
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
                // changed is not used here
                answers[question.id] = { answer: answer, changed: false }
            }
            // set the answer object so all fields are reactive now
            this.answers = answers
        },
        async updateReviewApproval(approvalByTA) {
            await api.reviewofsubmissions.setApproval(this.review.id, approvalByTA, this.review.commentByTA)
            this.showSuccessMessage({ message: "Review approval status changed" })
            await this.fetchReview()
        },
        async goToNextReviewWithoutApproval() {
            const reviews = []
            for (const assignmentVersion of this.assignment.versions) {
                const res = await api.reviewofsubmissions.getAllForAssignmentVersion(assignmentVersion.id, true)
                reviews.push(...res.data)
            }
            const reviewsWithoutApproval = _.filter(reviews, review => {
                return review.approvalByTA === null
            })
            if (reviewsWithoutApproval.length === 0) {
                this.showErrorMessage({ message: "No submitted reviews without approval are available" })
            } else {
                const randomReviewWithoutApproval = _.sample(reviewsWithoutApproval)
                this.$router.push({
                    name: this.$router.currentRoute.name,
                    params: { reviewId: randomReviewWithoutApproval.id }
                })
                location.reload()
            }
        },
        uploadAnswerFilePath(reviewId, questionId) {
            return `/api/uploadquestionanswers/file?reviewId=${reviewId}&questionId=${questionId}`
        },
        toggleViewFileNextToQuestionnaire() {
            this.viewFileNextToQuestionnaire = !this.viewFileNextToQuestionnaire
        }
    }
}
</script>
