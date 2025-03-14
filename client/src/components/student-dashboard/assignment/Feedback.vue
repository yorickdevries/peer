<template>
    <b-container fluid class="px-0">
        <b-tabs card>
            <b-tab v-if="assignment.assignmentType !== 'text'" title="File Annotation Feedback">
                <div v-if="finalSubmission == null">No final submission found.</div>
                <div v-else-if="finalSubmission.file.extension !== '.pdf' && assignment.assignmentType === 'document'">
                    Your submission was not a .pdf file, so it was not annotated by reviewers.
                </div>
                <div v-else-if="feedbackReviews.length === 0">No feedback available.</div>
                <b-tabs v-else>
                    <b-tab v-for="(tab, index) in tabs" :key="tab.id">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge v-if="tab.aggregated" variant="warning" class="mr-2">ALL Reviews</b-badge>
                                <b-badge v-else :style="{ 'background-color': reviewColors[tab.id] }" class="mr-2">
                                    Review #{{ index + (tabs.length === 1 ? 1 : 0) }}
                                </b-badge>
                                <b-badge v-if="tab.annotationCount === 1" variant="primary"> 1 annotation </b-badge>
                                <b-badge v-else variant="primary">
                                    {{ tab.annotationCount }}
                                    annotations
                                </b-badge>
                            </div>
                        </template>
                        <div
                            v-if="
                                !feedbackReviews.find((feedbackReview) => feedbackReview.id === tab.id) ||
                                feedbackReviews.find((feedbackReview) => feedbackReview.id === tab.id).approvalByTA ||
                                feedbackReviews.find((feedbackReview) => feedbackReview.id === tab.id).approvalByTA ===
                                    null
                            "
                        >
                            <FileAnnotator
                                v-if="tab.aggregated"
                                :submissionId="finalSubmission.id"
                                :assignmentType="assignment.assignmentType"
                                :readOnly="true"
                                :reviewColors="reviewColors"
                            />
                            <FileAnnotator
                                v-else
                                :reviewId="tab.id"
                                :assignmentType="assignment.assignmentType"
                                :readOnly="true"
                                :reviewColors="reviewColors"
                            />
                        </div>
                        <div v-else>
                            <b-alert show variant="success" class="p-2">This review was redacted</b-alert>
                        </div>
                    </b-tab>
                </b-tabs>
            </b-tab>
            <b-tab title="Questionnaire Feedback">
                <!--Feedback Information-->
                <b-card header="Feedback" class="h-100">
                    <div v-if="feedbackReviews.length === 0">No feedback available.</div>
                    <div v-else>
                        <b-row>
                            <!--Side-bar for questions -->
                            <b-col class="pl-0">
                                <b-list-group style="max-height: 1000px; overflow-y: auto">
                                    <b-list-group-item
                                        v-for="questionnaireQuestion in questionnaire.questions"
                                        :key="questionnaireQuestion.id"
                                        @click="question = questionnaireQuestion"
                                        :active="question === questionnaireQuestion"
                                        style="cursor: pointer"
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
                                            <b-card v-if="question.type === 'multiplechoice'">
                                                <h6>Multiple Choice Overview:</h6>
                                                <vue-poll
                                                    v-bind="aggregateMultipleChoice(question)"
                                                    :showResults="true"
                                                />
                                            </b-card>
                                            <b-card v-if="question.type === 'range'">
                                                <h6>Average Rating:</h6>
                                                <!-- RANGE QUESTION -->
                                                <StarRating
                                                    :rating="aggregateRange(question)"
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
                                            </b-card>
                                            <b-card v-if="question.type === 'checkbox'">
                                                <h6>Checkbox Overview:</h6>
                                                <vue-poll v-bind="aggregateCheckbox(question)" :showResults="true" />
                                            </b-card>
                                        </b-list-group-item>
                                        <b-list-group-item v-for="(answer, index) in answers[question.id]" :key="index">
                                            <!-- It can be null when a review is redacted -->
                                            <div v-if="answer !== null">
                                                <!-- OPEN QUESTION -->
                                                <MarkdownEditorViewer
                                                    :key="answer"
                                                    v-if="question.type === 'open'"
                                                    :answer-object="answer"
                                                    :displayeditor="false"
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
                                                    <b-row>
                                                        <b-col>
                                                            <!--Show whether file has been uploaded-->
                                                            <b-alert show variant="success" class="p-2"
                                                                >File uploaded:
                                                                <a
                                                                    :href="
                                                                        uploadAnswerFilePath(
                                                                            answer.reviewId,
                                                                            question.id
                                                                        )
                                                                    "
                                                                    >{{ answer.name }}{{ answer.extension }}</a
                                                                >
                                                            </b-alert>
                                                        </b-col>
                                                        <b-col>
                                                            <b-button
                                                                v-if="answer.extension === '.pdf'"
                                                                v-b-modal="`showPDF-${answer.reviewId}-${question.id}`"
                                                            >
                                                                Show PDF
                                                            </b-button>
                                                            <b-modal
                                                                :id="`showPDF-${answer.reviewId}-${question.id}`"
                                                                title="PDF"
                                                                size="xl"
                                                                centered
                                                                hide-footer
                                                            >
                                                                <PDFViewer
                                                                    :fileUrl="
                                                                        uploadAnswerFilePath(
                                                                            answer.reviewId,
                                                                            question.id
                                                                        )
                                                                    "
                                                                />
                                                            </b-modal>
                                                        </b-col>
                                                    </b-row>
                                                </b-form-group>
                                            </div>
                                            <div v-else>
                                                <b-alert show variant="success" class="p-2"
                                                    >This review was redacted</b-alert
                                                >
                                            </div>
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
import FileAnnotator from "./FileAnnotator"
import PDFViewer from "../../general/PDFViewer"
import "@toast-ui/editor/dist/toastui-editor-viewer.css"
import MarkdownEditorViewer from "@/components/general/MarkdownEditorViewer"
import VuePoll from "vue-poll"

export default {
    components: { StarRating, FileAnnotator, PDFViewer, MarkdownEditorViewer, VuePoll },
    data() {
        return {
            assignment: {},
            assignmentversion: null,
            group: {},
            finalSubmission: null,
            questionnaire: {},
            feedbackReviews: [],
            answers: null,
            // selected question
            question: null,
            tabs: [{ id: -1, aggregated: true, annotationCount: 0 }],
        }
    },
    computed: {
        numberOfFlaggedByReviewer() {
            return _.filter(this.feedbackReviews, "flaggedByReviewer").length
        },
        reviewColors() {
            // https://davidmathlogic.com/colorblind/#%23648FFF-%23785EF0-%23DC267F-%23FE6100-%23FFB000
            const colors = ["#ffb000", "#648fff", "#fe6100", "#785ef0", "#dc267f"]
            const result = {}
            this.feedbackReviews.forEach((review, index) => {
                if (!review.aggregated) {
                    result[review.id] = colors[index % colors.length]
                }
            })
            return result
        },
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        aggregateRange(question) {
            return Math.round(
                this.answers[question.id].reduce(function (a, b) {
                    return a + b
                }) / this.answers[question.id].length
            )
        },
        aggregateCheckbox(question) {
            // Option ids don't necessarily start at 1
            let optionMap = {}
            for (let i = 0; i < question.options.length; i++) {
                optionMap[question.options[i].id] = {
                    initOrder: i,
                    text: question.options[i].text,
                    votes: 0,
                }
            }

            for (let i = 0; i < this.answers[question.id].length; i++) {
                if (this.answers[question.id][i].length === 0) {
                    continue
                }
                for (let k = 0; k < question.options.length; k++) {
                    if (this.answers[question.id][i][k] === undefined) {
                        continue
                    }
                    let optionId = this.answers[question.id][i][k].id
                    let currAnswer = optionMap[optionId]
                    if (currAnswer !== undefined) {
                        currAnswer.votes++
                    }
                }
            }
            const compareByInitOrder = (a, b) => a.initOrder - b.initOrder
            return { question: "", answers: Object.values(optionMap).sort(compareByInitOrder) }
        },
        aggregateMultipleChoice(question) {
            // Option ids don't necessarily start at 1
            let optionMap = {}

            for (let i = 0; i < question.options.length; i++) {
                optionMap[question.options[i].id] = {
                    initOrder: i,
                    text: question.options[i].text,
                    votes: 0,
                }
            }

            for (let i = 0; i < this.answers[question.id].length; i++) {
                let optionId = this.answers[question.id][i].id
                let currAnswer = optionMap[optionId]
                if (currAnswer !== undefined) {
                    currAnswer.votes++
                }
            }
            const compareByInitOrder = (a, b) => a.initOrder - b.initOrder
            return { question: "", answers: Object.values(optionMap).sort(compareByInitOrder) }
        },
        async fetchData() {
            await this.fetchAssignment()
            await this.fetchGroup()
            await this.fetchFinalSubmission()
            await this.fetchAssignmentVersion()
            await this.fetchSubmissionQuestionnaire()
            await this.fetchFeedbackReviews()
            await this.aggregateFeedback()
            await this.createTabs()
            // automatically open first question
            if (this.questionnaire.questions.length !== 0) {
                this.question = this.questionnaire.questions[0]
            }
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
        async fetchAssignmentVersion() {
            const res = await api.assignmentversions.get(this.finalSubmission.assignmentVersionId)
            this.assignmentVersion = res.data
        },
        async fetchSubmissionQuestionnaire() {
            const res = await api.submissionquestionnaires.get(this.assignmentVersion.submissionQuestionnaireId)
            this.questionnaire = res.data
        },
        async fetchFeedbackReviews() {
            const res = await api.submissions.getFeedback(this.finalSubmission.id)
            this.feedbackReviews = res.data
        },
        async createTabs() {
            // TODO: Make getting the amount of annotations an actual endpoint (for both annotation types)
            // to prevent loading all annotations here as well as in the annotators.
            await Promise.all(
                this.feedbackReviews.map(async (review) => {
                    if (this.assignment.assignmentType === "document") {
                        return api.pdfannotations.get(
                            review.id,
                            (await api.reviewofsubmissions.getFileMetadata(review.id)).data.id
                        )
                    } else if (this.assignment.assignmentType === "code") {
                        return await api.codeannotations.getAnnotations(review.id)
                    }
                })
            ).then((results) => {
                results.forEach((result, index) => {
                    this.tabs.push({ id: this.feedbackReviews[index].id, annotationCount: result.data.length })
                })
            })

            if (this.tabs.length === 2) {
                // Only one review, having an aggregated tab does not make sense
                this.tabs.splice(
                    this.tabs.findIndex((tab) => tab.aggregated),
                    1
                )
            } else {
                this.tabs[0].annotationCount = this.tabs.reduce((acc, val) => acc + val.annotationCount, 0)
                this.tabs.sort((a, b) => a.id - b.id)
            }
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
                const feedbackReviewApproval = feedbackReview.approvalByTA
                // iterate over questions and get answers

                for (const question of this.questionnaire.questions) {
                    if (feedbackReviewApproval || feedbackReviewApproval == null) {
                        const answer = this.getAnswerForQuestion(feedbackReviewAnswers, question)
                        if (answer !== null) {
                            // add review id so users can download files
                            if (question.type === "upload") {
                                answer.reviewId = feedbackReview.id
                            }
                            answers[question.id].push(answer)
                        }
                    } else {
                        answers[question.id].push(null)
                    }
                }
            }
            // set the answer object so all fields are reactive now
            this.answers = answers
        },
        getAnswerForQuestion(existingAnswers, question) {
            let answer = null
            // find existing answer
            const existingAnswer = _.find(existingAnswers, (answer) => {
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
        },
    },
}
</script>
