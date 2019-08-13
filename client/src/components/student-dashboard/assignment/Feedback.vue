<template>
    <div>
        <b-card no-body>
            <b-tabs card>
                <b-tab title="Student Feedback">
                    <b-card v-if="peerReviews.length === 0">No feedback available.</b-card>

                    <b-container v-else fluid>
                        <b-row>
                            <!--Side-bar for questions -->
                            <b-col class="pl-0">
                                <b-list-group>
                                    <b-list-group-item
                                            v-for="question in sortedQuestionsList"
                                            :key="question.question_number"
                                            @click="activeQuestion = question"
                                            :active="activeQuestion === question">
                                        Question #{{ question.question_number}}
                                    </b-list-group-item>
                                </b-list-group>
                            </b-col>

                            <!--Feedback view with 1 question at a time-->
                            <b-col cols="9" class="pr-0">
                                <b-card no-body>

                                    <!--Title-->
                                    <b-card-body>
                                        <h4>Feedback</h4>
                                        <h6 class="card-subtitle text-muted">Feedback given to you aggregated per
                                            question.</h6>
                                    </b-card-body>

                                    <!--Single Active Question-->
                                    <b-list-group flush>

                                        <b-list-group-item>
                                            <div class="">
                                                <h5 class="text-primary">Question {{ activeQuestion.question_number
                                                    }}</h5>
                                                {{ activeQuestion.question }}
                                            </div>
                                        </b-list-group-item>

                            <b-list-group-item v-for="(pair, index) in aggregateQuestionAnswer(activeQuestion.question_number)" :key="index">

                                <!--&lt;!&ndash; OPEN QUESTION &ndash;&gt;-->
                                <template v-if="activeQuestion.type_question === 'open'">

                                    <b-form-textarea
                                            id="textarea1"
                                            :value="pair.answer.answer"
                                            :rows="10"
                                            readonly
                                            :max-rows="15"/>
                                </template>

                                <!--&lt;!&ndash; RANGE QUESTION &ndash;&gt;-->
                                <StarRating v-else-if="activeQuestion.type_question === 'range'"
                                            class="align-middle"
                                            :border-color="'#007bff'"
                                            :active-color="'#007bff'"
                                            :border-width="2"
                                            :item-size="20"
                                            :spacing="5"
                                            read-only
                                            :rating="pair.answer.answer"
                                            :max-rating="pair.question.range"/>

                                <!--&lt;!&ndash; MPC QUESTION &ndash;&gt;-->
                                <b-form-group v-else-if="activeQuestion.type_question === 'mc'" class="mb-0">
                                    <b-form-radio-group
                                            :checked="pair.answer.answer"
                                            :options="transformOptionsToHTMLOptions(activeQuestion.option)"
                                            disabled
                                            stacked>
                                    </b-form-radio-group>
                                </b-form-group>

                                <!--&lt;!&ndash; UPLOAD QUESTION &ndash;&gt;-->
                                <template v-if="activeQuestion.type_question === 'upload'">
                                    <a target="_blank" :href="uploadQuestionFilePath(pair.peerReviewId, pair.question.id)">{{ pair.answer.answer }}</a>
                                </template>


                            </b-list-group-item>

                        </b-list-group>

                    </b-card>
                </b-col>

                        </b-row>
                    </b-container>
                </b-tab>

                <!--TA Feedback Comments-->
                <b-tab title="TA Feedback">

                    <!--Submission Feedback-->
                    <b-card header="Submission Feedback" class="mb-3">

                        <p class="text-muted">The feedback TA's will give on your submission will be shown here.</p>

                        <b-list-group v-if="comments.length > 0">

                            <!--Single Comment-->
                            <b-list-group-item v-for="(comment, index) in comments" :key="comment.id">
                                <dl class="mb-0">
                                    <dt>Comment {{ index + 1 }}</dt>
                                    <dd>
                                        <b-form-textarea v-model="comment.comment"
                                                         placeholder="Input your submission comment here."
                                                         max-rows="10"
                                                         readonly></b-form-textarea>
                                    </dd>

                                    <dt>Created by TA</dt>
                                    <dd>{{ comment.netid }}</dd>
                                </dl>
                            </b-list-group-item>
                        </b-list-group>
                        <div v-else>There has not yet been any feedback on your submission from a TA.</div>
                    </b-card>

                    <!--Review Feedback-->
                    <b-card header="Review Feedback">

                        <p class="text-muted">The feedback TA's will give on the peer reviews that you have given to other students will be shown here. It will be either approved, disapproved or there might not have been any action taken yet.</p>

                        <div v-for="(peerReview, index) in peerReviewsToOthers" :key="peerReview.review.id">

                            <dl :class="{ 'mb-0': index === peerReviews.length - 1}">
                                <dt>Review {{ index + 1 }} Status</dt>
                                <dd v-if="peerReview.review.approved">Approved 👍</dd>
                                <dd v-if="peerReview.review.approved === false">Disapproved 👎</dd>
                                <dd v-if="peerReview.review.approved === null || peerReview.undefined">No action taken yet by any TA.</dd>
                            </dl>
                        </div>


                    </b-card>

                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>

<script>
import { StarRating } from 'vue-rate-it';
import api from "../../../api"

export default {
    components: {
        StarRating
    },
    data() {
        return {
            peerReviews: [],
            peerReviewsToOthers: [],
            activeQuestion: {},
            comments: []
        }
    },
    computed: {
        sortedQuestionsList() {
            // Returns the sorted list of questions.
            if (this.peerReviews.length === 0) return
            let questions = this.peerReviews[0].form.slice().map(value => value.question)
            return questions.sort((a, b) => a.question_number - b.question_number)
        }
    },
    async created() {

        // Retrieve peer review RECEIVED.
        const {data: receivedIds} = await api.getFeedbackOfAssignment(this.$route.params.assignmentId)
        const receivedFlatIds = receivedIds.map(value => value.id)

        this.peerReviews = await this.foreignKeyJoinOfPeerReviews(receivedFlatIds)

        // Retrieve peer reviews GIVEN.
        const {data: givenIds} = await api.getGivenFeedbackOfAssignment(this.$route.params.assignmentId)
        const givenFlatIds = givenIds.map(value => value.id)

        this.peerReviewsToOthers = await this.foreignKeyJoinOfPeerReviews(givenFlatIds)

        // Set the default active question.
        if (this.sortedQuestionsList !== undefined)
            this.activeQuestion = this.sortedQuestionsList[0]

        await this.getSubmissionComments()

    },
    methods: {

        async foreignKeyJoinOfPeerReviews(ids) {

            let peerReviews = []
            for (let i = 0; i < ids.length; i++) {
                let {data} = await api.getPeerReview(ids[i])
                peerReviews.push(data)
            }
            return peerReviews

        },

        aggregateQuestionAnswer(targetQuestionNumber) {
            // Aggregates the answers for a particular question into an array of answers.
            let res = []
            this.peerReviews.forEach(peerReview => {
                let pair = peerReview.form.find(questionAnswerPair => questionAnswerPair.question.question_number === targetQuestionNumber)
                res.push({
                    ...pair,
                    // Add for later use when you need to gather the link for the upload question.
                    peerReviewId: peerReview.review.id
                })
            })
            return res
        },
        transformOptionsToHTMLOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return { text: option.option, value: option.id }
            })
        },
        async getSubmissionComments() {
            try {
                let resSubmission = await api.getAssignmentLatestSubmission(this.$route.params.assignmentId)
                let submissionId = resSubmission.data.id
                let res = await api.client.get(`submissions/${submissionId}/allComments`)
                this.comments = res.data
            } catch (e) {
                console.log(e)
                this.showErrorMessage()
            }
        },
        uploadQuestionFilePath(reviewId, questionId) {
            return `/api/reviews/${reviewId}/questions/${questionId}/file`
        }
    },
}
</script>
