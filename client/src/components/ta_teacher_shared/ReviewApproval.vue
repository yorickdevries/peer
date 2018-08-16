<template>
    <div>
        <b-container>

            <!--Header-->
            <BreadcrumbTitle :items="['Assignment', 'Reviews']" class="mt-3"></BreadcrumbTitle>

            <b-card header="Review Information">
                <div class="d-flex justify-content-between">

                    <!--Approval-->
                    <div>
                        <dl>
                            <dt>Current approval status</dt>
                            <dd v-if="peerReview.review.approved">Approved</dd>
                            <dd v-if="peerReview.review.approved === false">Disapproved</dd>
                            <dd v-if="peerReview.review.approved === null || peerReview.undefined">No action yet by any TA.</dd>
                            <dd>
                                <b-button variant="danger" class="mr-2"
                                    @click="disapprove"
                                    :disabled="peerReview.review.approved === false">
                                    Disapprove 👎
                                </b-button>
                                <b-button variant="success"
                                    @click="approve"
                                    :disabled="peerReview.review.approved">
                                    Approve 👍
                                </b-button>
                            </dd>
                        </dl>

                    </div>

                    <!--Download-->
                    <div>
                        <dl>
                            <dt>Download</dt>
                            <dd>The download for the submission this review is about.</dd>
                            <a :href="peerReviewFilePath" target="_blank">
                                <button type="button" class="btn btn-success success">Download Submission</button>
                            </a>
                        </dl>
                    </div>
                </div>

            </b-card>

            <b-card no-body class="mt-3">
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

                        <!-- OPEN QUESTION -->
                        <b-form-textarea v-if="pair.question.type_question === 'open'"
                                         id="textarea1"
                                         placeholder="Enter something"
                                         :rows="3"
                                         :max-rows="6"
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

                    </b-list-group-item>
                </b-list-group>
            </b-card>

        </b-container>
    </div>
</template>

<script>
import api from "../../api"
import notifications from '../../mixins/notifications'
import BreadcrumbTitle from '../BreadcrumbTitle'
import {StarRating} from 'vue-rate-it';

export default {
    mixins: [notifications],
    components: {BreadcrumbTitle, StarRating},
    data() {
        return {
            peerReview: {
                review: {
                    id: null,
                    rubric_assignment_id: null,
                    file_path: "",
                    comment: null,
                    done: null,
                    approved: null,
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
            return this.peerReview.form.length
        },
        peerReviewFilePath() {
            // Get the submission file path.
            return `/api/reviews/${this.peerReview.review.id}/file`
        }
    },
    async created() {

        // Load review.
        try {
            const {data: peerReview} = await api.getPeerReview(this.$route.params.reviewId)
            this.peerReview = peerReview
        } catch (e) {
            this.showErrorMessage({message: 'Review could not be loaded.'})
        }

    },
    methods: {
        transformOptionsToHTMLOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return {text: option.option, value: option.id}
            })
        },
        async disapprove() {
            this.peerReview.review.approved = false
            await this.updateApproval()
        },
        async approve() {
            this.peerReview.review.approved = true
            await this.updateApproval()
        },
        async updateApproval() {
            try {
                await api.client.post(`/reviews/${this.peerReview.review.id}/grade`, {
                    approved: this.peerReview.review.approved
                })
                this.showSuccessMessage({message: 'Review approval status changed'})
            } catch (e) {
                this.showErrorMessage({message: 'Something went wrong with approving/disapproving this review'})
            }
        }

    }

}
</script>
