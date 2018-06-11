<template>
    <div>

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
                            <h6 class="card-subtitle text-muted">Feedback given to you aggregated per question.</h6>
                        </b-card-body>

                        <!--Single Active Question-->
                        <b-list-group flush>

                            <b-list-group-item>
                                <div class="">
                                    <h5 class="text-primary">Question {{ activeQuestion.question_number }}</h5>
                                    {{ activeQuestion.question}}
                                </div>
                            </b-list-group-item>

                            <b-list-group-item v-for="(answer, index) in aggregateQuestionAnswer(activeQuestion.question_number)" :key="index">

                                <!--&lt;!&ndash; OPEN QUESTION &ndash;&gt;-->
                                <template v-if="activeQuestion.type_question === 'open'">

                                    <b-form-textarea
                                            id="textarea1"
                                            :value="answer.answer"
                                            :rows="3"
                                            readonly
                                            :max-rows="6"/>
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
                                            :rating="answer.answer"
                                            :max-rating="7"/>

                                <!--&lt;!&ndash; MPC QUESTION &ndash;&gt;-->
                                <b-form-group v-else-if="activeQuestion.type_question === 'mc'" class="mb-0">
                                    <b-form-radio-group
                                            :checked="answer.answer"
                                            :options="transformOptionsToHTMLOptions(activeQuestion.option)"
                                            stacked>
                                    </b-form-radio-group>
                                </b-form-group>

                            </b-list-group-item>

                        </b-list-group>

                    </b-card>
                </b-col>

            </b-row>
        </b-container>
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
            activeQuestion: {}
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
        // Get feedback array of reviews.
        let metaRes = await api.getFeedbackOfAssignment(this.$route.params.assignmentId)
        metaRes.data.forEach(async value => {
            let review = await api.getPeerReview(value.id)
            this.peerReviews.push(review.data)
        })
        this.activeQuestion = this.sortedQuestionsList[0]

    },
    methods: {
        aggregateQuestionAnswer(targetQuestionNumber) {
            // Aggregates the answers for a particular question into an array of answers.
            let res = []
            this.peerReviews.forEach(peerReview => {
                let pair = peerReview.form.find(questionAnswerPair => questionAnswerPair.question.question_number === targetQuestionNumber)
                res.push(pair.answer)
            })
            return res
        },
        transformOptionsToHTMLOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return { text: option.option, value: option.id }
            })
        },
    },
}
</script>
