<template>
    <div>

        <b-row>
            <!--Title Card with Download Button-->
            <b-col>
                <b-card no-body>
                    <b-card-body>
                        <b-container fluid class="px-0">
                            <b-row>
                                <b-col>
                                    <span class="text-muted">You are giving feedback to</span><br>
                                    <span class="lead">Peer #{{ peerReview.review.id }}</span>
                                </b-col>
                                <b-col>
                                    <a href="http://www.example.path"><button type="button" class="btn btn-success success w-100 h-100">Download Hand-In</button></a>
                                </b-col>
                            </b-row>
                        </b-container>
                    </b-card-body>
                </b-card>
            </b-col>
            <b-col cols="3">
                <b-card no-body>
                    <b-card-body>
                        <b-container fluid class="px-0">
                            <b-row>
                                <b-col>
                                    <span class="text-muted">This is peer review</span><br>
                                    <span class="lead">{{ peerReview.review.id }} / 5</span>
                                </b-col>
                            </b-row>
                        </b-container>
                    </b-card-body>
                </b-card>
            </b-col>

        </b-row>
        <!--Peer Review Form-->
        <b-card no-body class="mt-3">

            <!--Title-->
            <b-card-body>
                <h4>Assignment Criteria</h4>
                <h6 class="card-subtitle text-muted">Give the peer review to one of your peers here.</h6>
            </b-card-body>

            <!--Questions-->
            <b-list-group flush>

                <!--Loop through all the questions.-->
                <b-list-group-item v-for="pair in peerReview.form" :key="pair.question.question_number">
                    <div class="mb-2 bottom-right">
                        <h5 class="text-primary">Question {{ pair.question.question_number }}</h5>
                        <p>
                            {{ pair.question.question }}
                        </p>
                    </div>

                    <!-- OPEN QUESTION -->
                    <b-form-textarea v-if="pair.question.type_question === 'open'"
                                     id="textarea1"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6"
                                     v-model="pair.answer.answer" />

                    <!-- RANGE QUESTION -->
                    <StarRating v-else-if="pair.question.type_question === 'range'"
                                class="align-middle"
                                :border-color="'#007bff'"
                                :active-color="'#007bff'"
                                :border-width="2"
                                :item-size="20"
                                :spacing="5"
                                inline
                                :max-rating="7"
                                :show-rating="false"
                                v-model="pair.answer.answer"/>

                    <!-- MPC QUESTION -->
                    <b-form-group v-else-if="pair.question.type_question === 'mc'">
                        <b-form-radio-group
                                :options="transformOptions(pair.question.option)"
                                v-model="pair.answer.answer_option"
                                stacked>
                        </b-form-radio-group>
                    </b-form-group>

                </b-list-group-item>

            </b-list-group>

            <!--Save/Submit Button-->
            <b-card-body>
                <b-button variant="success float-right" @click="submitPeerReview">Submit Review</b-button>
                <b-button variant="primary float-right mr-2" @click="savePeerReview">Save Review</b-button>
            </b-card-body>
        </b-card>

    </div>
</template>

<script>
import { StarRating } from 'vue-rate-it';
import api from "../../../api";

export default {
    async created() {

        // Get the peer review ID from this assignment that is active.
        let peerReviewID = 1

        // Get peer review.
        let res = await api.getPeerReview(peerReviewID)
        this.peerReview = res.data

        console.log(res)
    },
    data() {
        return {
            peerReview: {
                review: {
                    id: null,
                    rubric_assignment_id: null,
                    file_path: null,
                    comment: null,
                    done: null,
                },

                form: []
            },
        }
    },
    methods: {
        transformOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return { text: option.option, value: option.id }
            })
        },
        async submitPeerReview() {
            await api.submitPeerReview(this.peerReview)
        },
        async savePeerReview() {
            // Submit a PUT to save the current peer review.
            let res = await api.savePeerReview(this.peerReview.review.id, this.peerReview)
            this.peerReview = res.data
        }
    },
    components: {
        StarRating
    }
}
</script>