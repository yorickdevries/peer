<template>
    <b-container fluid class="px-0">
        <b-tabs card>
            <b-tab title="PDF Annotation Feedback">
                <PDFAnnotator
                    v-if="finalSubmission.file.extension === '.pdf'"
                    :submissionId="finalSubmission.id"
                    :readOnly="true"
                ></PDFAnnotator>
                <div v-else>Your submission was not a .pdf file, so it was not annotated by reviewers</div>
            </b-tab>
            <b-tab title="Questionnaire Feedback">
                <!--Feedback Information-->
                <b-card header="Feedback" class="h-100">
                    <div v-if="feedbackReviews.length === 0">No feedback available.</div>
                    <div v-else>
                        <b-row>
                            <!--Side-bar for questions -->
                            <b-col class="pl-0">
                                <b-list-group>
                                    <b-list-group-item
                                        v-for="questionnaireQuestion in questionnaire.questions"
                                        :key="questionnaireQuestion.id"
                                        @click="question = questionnaireQuestion"
                                        :active="question === questionnaireQuestion"
                                        style="cursor: pointer;"
                                    >
                                        Question {{ questionnaireQuestion.number }} of
                                        {{ questionnaire.questions.length }}
                                    </b-list-group-item>
                                </b-list-group>
                            </b-col>

                            <!--Feedback view with 1 question at a time-->
                            <b-col cols="9" class="pr-0">
                                <b-card no-body>
                                    <!--Title-->
                                    <b-card-body>
                                        <b-row>
                                            <b-col cols="6">
                                                <h4>Feedback</h4>
                                                <h6 class="card-subtitle text-muted">
                                                    Feedback given to you aggregated per question.
                                                </h6>
                                            </b-col>
                                            <b-col cols="6">
                                                <h5>Submission flagged</h5>
                                                <h6 class="card-subtitle text-muted">
                                                    {{ numberOfFlaggedByReviewer }} out of
                                                    {{ this.feedbackReviews.length }} reviewers reported the submission
                                                    as empty or not serious.
                                                </h6>
                                            </b-col>
                                        </b-row>
                                    </b-card-body>

                                    <!--Single Active Question-->
                                    <b-list-group v-if="question" flush>
                                        <b-list-group-item>
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
                                            <!-- Text-->
                                            <h4>{{ question.text }}</h4>
                                        </b-list-group-item>

                                        <b-list-group-item v-for="(answer, index) in answers[question.id]" :key="index">
                                            <!-- OPEN QUESTION -->
                                            <b-form-textarea
                                                v-if="question.type === 'open'"
                                                placeholder="Enter your answer"
                                                :rows="10"
                                                :max-rows="15"
                                                :value="answer"
                                                readonly
                                                required
                                            />

                                            <!-- MULTIPLE CHOICE QUESTION -->
                                            <b-form-radio-group
                                                v-if="question.type === 'multiplechoice'"
                                                :checked="answer"
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
                                                :checked="answer"
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
                                                :rating="answer"
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
                                                <!--Show whether file has been uploaded-->
                                                <b-alert show variant="success" class="p-2"
                                                    >File uploaded:
                                                    <a :href="uploadAnswerFilePath(answer.reviewId, question.id)"
                                                        >{{ answer.name }}{{ answer.extension }}</a
                                                    >
                                                </b-alert>
                                            </b-form-group>
                                        </b-list-group-item>
                                    </b-list-group>
                                </b-card>
                            </b-col>
                        </b-row>
                    </div>
                </b-card>
            </b-tab>
        </b-tabs>
    </b-container>
</template>

<script>
import api from "../../../api/api"
import _ from "lodash"
import { StarRating } from "vue-rate-it"
import PDFAnnotator from "./PDFAnnotator"

export default {
    components: { StarRating, PDFAnnotator },
    data() {
        return {
            assignment: {},
            group: {},
            finalSubmission: null,
            questionnaire: {},
            feedbackReviews: [],
            answers: null,
            // selected question
            question: null
        }
    },
    computed: {
        numberOfFlaggedByReviewer() {
            return _.filter(this.feedbackReviews, "flaggedByReviewer").length
        }
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            await this.fetchAssignment()
            await this.fetchGroup()
            await this.fetchFinalSubmission()
            await this.fetchSubmissionQuestionnaire()
            await this.fetchFeedbackReviews()
            await this.aggregateFeedback()
        },
        async fetchAssignment() {
            // Fetch the assignment information.
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchGroup() {
            // Fetch the group information.
            const res = await api.assignments.getGroup(this.$route.params.assignmentId)
            this.group = res.data
        },
        async fetchFinalSubmission() {
            // Fetch the submission.
            const res = await api.assignments.getFinalSubmission(this.$route.params.assignmentId, this.group.id)
            this.finalSubmission = res.data
        },
        async fetchSubmissionQuestionnaire() {
            const res = await api.submissionquestionnaires.get(this.assignment.submissionQuestionnaireId)
            this.questionnaire = res.data
        },
        async fetchFeedbackReviews() {
            const res = await api.submissions.getFeedback(this.finalSubmission.id)
            this.feedbackReviews = res.data
        },
        async aggregateFeedback() {
            // construct answer map with empty lists
            const answers = {}
            for (const question of this.questionnaire.questions) {
                answers[question.id] = []
            }
            // fetch all answers for every review
            for (const feedbackReview of this.feedbackReviews) {
                const res = await api.reviewofsubmissions.getAnswers(feedbackReview.id)
                const feedbackReviewAnswers = res.data
                // iterate over questions and get answers
                for (const question of this.questionnaire.questions) {
                    const answer = this.getAnswerForQuestion(feedbackReviewAnswers, question)
                    if (answer !== null) {
                        // add review id so users can download files
                        if (question.type === "upload") {
                            answer.reviewId = feedbackReview.id
                        }
                        answers[question.id].push(answer)
                    }
                }
            }
            // set the answer object so all fields are reactive now
            this.answers = answers
        },
        getAnswerForQuestion(existingAnswers, question) {
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
            return answer
        },
        uploadAnswerFilePath(reviewId, questionId) {
            return `/api/uploadquestionanswers/file?reviewId=${reviewId}&questionId=${questionId}`
        }
    }
}
</script>
