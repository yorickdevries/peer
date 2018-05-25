<template>
    <div>
        <b-container fluid class="">
            <b-row>

                <!--Side-bar for questions -->
                <b-col class="pl-0">
                    <b-list-group>
                        <b-list-group-item
                                v-for="question in sortedQuestionsList"
                                :key="question.question_number"
                                @click="setActiveQuestion(question)"
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
                                            :options="transformOptions(activeQuestion.option)"
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


export default {
    async created() {
        // Get feedback array of reviews.
        this.peerReviews = [review, review2, review]
        this.activeQuestion = this.sortedQuestionsList[0]
    },
    data() {
        return {
            peerReviews: [],
            activeQuestion: {}
        }
    },
    computed: {
        sortedQuestionsList() {
            let questions = this.peerReviews[0].form.slice().map(value => value.question)
            let questionsSorted = questions.sort((a, b) => a.question_number - b.question_number)
            return questionsSorted
        }
    },
    methods: {
        aggregateQuestionAnswer(targetQuestionNumber) {
            let res = []
            this.peerReviews.forEach(peerReview => {
                let pair = peerReview.form.find(questionAnswerPair => questionAnswerPair.question.question_number === targetQuestionNumber)
                res.push(pair.answer)
            })
            return res
        },
        setActiveQuestion(targetQuestionNumber) {
            this.activeQuestion = targetQuestionNumber
            console.log(this.activeQuestion)
        },
        transformOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return { text: option.option, value: option.id }
            })
        },
    },
    components: {
        StarRating
    }
}

let review =
    {
        "review": {
            "id": 1,
            "rubric_assignment_id": 4,
            "file_path": "submission1.pdf",
            "comment": "Very good",
            "done": false
        },
        "form": [
            {
                "question": {
                    "id": 5,
                    "type_question": "mc",
                    "question": "Choose an option2",
                    "question_number": 3,
                    "option": [
                        {
                            "id": 13,
                            "option": "Option 1 (1)",
                            "mcquestion_id": 5
                        },
                        {
                            "id": 14,
                            "option": "Option 2 (1)",
                            "mcquestion_id": 5
                        },
                        {
                            "id": 15,
                            "option": "Option 3 (1)",
                            "mcquestion_id": 5
                        }
                    ]
                },
                "answer": {
                    "answer": 15,
                    "mcquestion_id": 5,
                    "review_id": 1
                }
            },
            {
                "question": {
                    "id": 8,
                    "question": "Some open question5",
                    "rubric_assignment_id": 4,
                    "question_number": 1,
                    "type_question": "open"
                },
                "answer": {
                    "answer": "sdsada sadsa sadsada adssdsada sadsa sadsada adsasdsada sadsa sadsada adsasdsada sadsa sadsada adsasdsada sadsa sadsada adsasdsada sadsa sadsada adsasdsada sadsa sadsada adsasdsada sadsa sadsada adsasdsada sadsa sadsada adsasdsada sadsa sadsada adsasdsada sadsa sadsada adsaa",
                    "openquestion_id": 8,
                    "review_id": 1
                }
            },
            {
                "question": {
                    "id": 6,
                    "question": "Give a rating",
                    "range": 7,
                    "rubric_assignment_id": 4,
                    "question_number": 2,
                    "type_question": "range"
                },
                "answer": {
                    "answer": 1,
                    "rangequestion_id": 6,
                    "review_id": 1
                }
            }
        ]
    }

let review2 = {
    "review": {
        "id": 1,
        "rubric_assignment_id": 4,
        "file_path": "submission1.pdf",
        "comment": "Very good",
        "done": false
    },
    "form": [
        {
            "question": {
                "id": 5,
                "type_question": "mc",
                "question": "Choose an option2",
                "question_number": 3,
                "option": [
                    {
                        "id": 13,
                        "option": "Option 1 (1)",
                        "mcquestion_id": 5
                    },
                    {
                        "id": 14,
                        "option": "Option 2 (1)",
                        "mcquestion_id": 5
                    },
                    {
                        "id": 15,
                        "option": "Option 3 (1)",
                        "mcquestion_id": 5
                    }
                ]
            },
            "answer": {
                "answer": 13,
                "mcquestion_id": 5,
                "review_id": 1
            }
        },
        {
            "question": {
                "id": 8,
                "question": "Some open question5",
                "rubric_assignment_id": 4,
                "question_number": 1,
                "type_question": "open"
            },
            "answer": {
                "answer": "sdsada sadsa sd sadsadsasadsada adsa",
                "openquestion_id": 8,
                "review_id": 1
            }
        },
        {
            "question": {
                "id": 6,
                "question": "Give a rating",
                "range": 7,
                "rubric_assignment_id": 4,
                "question_number": 2,
                "type_question": "range"
            },
            "answer": {
                "answer": 5,
                "rangequestion_id": 6,
                "review_id": 1
            }
        }
    ]
}

</script>
