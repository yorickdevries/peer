<template>
    <div>

        <!--Download-->
        <b-row>
            <b-col>
                <a :href="peerReviewFilePath" target="_blank">
                    <button type="button" class="btn btn-success success w-100"
                            style="height: 3rem">Download Hand-In
                    </button>
                </a>
            </b-col>
        </b-row>

        <!--Form-->
        <b-card no-body class="mt-3">
            <!--Title-->
            <b-card-body>
                <h4>Assignment Criteria</h4>
                <h6 class="card-subtitle text-muted">Give the peer review to one of your peers here.</h6>
            </b-card-body>

            <!--Form-->
            <b-list-group flush>

                <!--Questions-->
                <b-list-group-item class="py-4" v-for="pair in peerReviewSorted.form"
                                   :key="pair.question.id + pair.question.type_question">

                    <!--Question Information-->
                    <div class="mb-2">
                        <h5 class="text-primary">Question {{ pair.question.question_number }} of {{
                            totalAmountOfQuestions }}</h5>
                        <p>{{ pair.question.question }}</p>
                    </div>

                    {{ pair }}

                    <!-- OPEN QUESTION -->
                    <b-form-textarea v-if="pair.question.type_question === 'open'"
                                     id="textarea1"
                                     placeholder="Enter something"
                                     :rows="10"
                                     :max-rows="15"
                                     v-model="pair.answer.answer"
                                     :readonly="peerReview.review.done"
                                     required/>

                    <!-- RANGE QUESTION -->
                    <StarRating v-else-if="pair.question.type_question === 'range'"
                                class="align-middle"
                                :border-color="'#007bff'"
                                :active-color="'#007bff'"
                                :border-width="2"
                                :item-size="20"
                                :spacing="5"
                                inline
                                :max-rating="Number(pair.question.range)"
                                :show-rating="false"
                                :read-only="peerReview.review.done"
                                v-model="pair.answer.answer"/>

                    <!-- MPC QUESTION -->
                    <b-form-group v-else-if="pair.question.type_question === 'mc'">
                        <b-form-radio-group
                                :options="transformOptionsToHTMLOptions(pair.question.option)"
                                v-model="pair.answer.answer"
                                stacked
                                required
                                :disabled="peerReview.review.done">
                        </b-form-radio-group>
                    </b-form-group>

                    <!-- UPLOAD QUESTION -->
                    <div v-if="pair.question.question_number === 6">

                        <UploadQuestionForm :question="pair.question"></UploadQuestionForm>

                    </div>

                </b-list-group-item>
            </b-list-group>


            <SessionCheck ref="sessionCheck"></SessionCheck>

            <template v-if="peerReview.review.id !== null">
                <!--Save/Submit Buttons-->
                <b-card-body v-if="!peerReview.review.done">
                    <b-btn type="submit" variant="success float-right" v-b-modal="`submit${peerReview.review.id}`">Submit Review</b-btn>
                    <b-button variant="secondary float-right mr-2" @click="savePeerReview">Save Review</b-button>
                    <!--Submit Modal-->
                    <b-modal    :id="`submit${peerReview.review.id}`"
                                title="Submit Confirmation"
                                @ok="submitPeerReview">
                        Do you really want to submit? This marks the review as finished.
                    </b-modal>
                </b-card-body>
                <b-card-body v-else>
                    <b-button variant="outline-success float-right" @click="unSubmitPeerReview">UnSubmit Review</b-button>
                </b-card-body>
            </template>

        </b-card>

    </div>
</template>

<script>
import api from "../../../api"
import { StarRating } from 'vue-rate-it';
import notifications from '../../../mixins/notifications'
import UploadQuestionForm from './UploadQuestionForm'
import SessionCheck from '../../general/SessionCheck'

export default {
    mixins: [notifications],
    components: {
        StarRating,
        SessionCheck,
        UploadQuestionForm
    },
    props: ["reviewId"],
    data() {
        return {
            peerReview: {
                review: {
                    id: null,
                    rubric_assignment_id: null,
                    file_path: "",
                    comment: null,
                    done: null,
                },
                form: []
            },
        }
    },
    computed: {
        peerReviewSorted() {
            // Returns the review object, but sorted on question number.
            return {
                review: this.peerReview.review,
                form: this.peerReview.form.slice().sort((a, b) => {
                    return a.question.question_number - b.question.question_number
                })
            }
        },
        totalAmountOfQuestions() {
            // Returns the total amount of questions.
            return this.peerReview.form.length
        },
        peerReviewFilePath() {
            // Get the submission file path.
            return `/api/reviews/${this.peerReview.review.id}/file`
        }
    },
    async created() {
        await this.fetchPeerReview()
    },
    methods: {
        async fetchPeerReview() {
            let {data} = await api.getPeerReview(this.reviewId)
            this.peerReview = data
        },
        async submitPeerReview() {

            // Validate all fields (required).
            let validated = true;
            this.peerReview.form.forEach(pair => {
                if (pair.answer.answer === null || pair.answer.answer === undefined || pair.answer.answer === "") {
                    validated = false
                }
            })

            // Give validation error/success based on validation.
            if (validated) {
                // Save the peer review.
                await this.savePeerReview()

                // Submit peer review.
                await api.submitPeerReview(this.peerReview)
                await this.fetchPeerReview()
                this.showSubmitMessage()
            } else {
                this.showErrorMessage({message: "All fields are required."})
            }
        },
        async savePeerReview() {

            // Session check.
            const inSession = await this.$refs.sessionCheck.sessionGuardCheck()
            if (!inSession) {
                return
            }

            try {
                await api.savePeerReview(this.peerReview.review.id, this.peerReview)
            } catch (error) {
                this.showErrorMessage({message: "Error saving peer review."})
            }
            await this.fetchPeerReview()
            this.showSaveMessage()
        },
        async unSubmitPeerReview() {
            // unSubmit peer review.
            try {
                await api.unSubmitPeerReview(this.peerReview)
                await this.fetchPeerReview()
                this.showUnSubmitMessage()
            } catch (error) {
                this.showErrorMessage({message: "Error unsubmitting peer review."})
            }
        },
        transformOptionsToHTMLOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return {text: option.option, value: option.id}
            })
        },
    },
}
</script>