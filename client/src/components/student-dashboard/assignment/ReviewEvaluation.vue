<template>
    <div>

        <!--Debug-->
        <div>{{ evaluationExists }}</div>
        <div>{{ evaluation }}</div>
        <div>{{ review }}</div>

        <!--See Peer Review-->
        <div v-if="review.review.id">
            <b-row>
                <b-col>
                    <b-button v-b-modal="`modal_${review.review.id}`" variant="success" class="w-100" style="height: 3rem">
                        Open Review
                    </b-button>
                </b-col>
            </b-row>

            <b-modal title="Peer Review" :id="`modal_${review.review.id}`" size="lg" hide-footer>
                    <PeerReview :reviewId="review.review.id" :readOnly="true"></PeerReview>
            </b-modal>
        </div>

        <div v-if="!evaluationExists" class="mt-3">
            <b-alert show variant="info">
                You can give an evaluation of a review that you have received by clicking the button down below.
                <div>
                    <b-button @click="createEvaluationButton()" variant="primary" class="mt-2">
                        I want to evaluate this review
                    </b-button>
                </div>
            </b-alert>
        </div>


    </div>
</template>

<script>
import api from "../../../api"
import { StarRating } from 'vue-rate-it';
import notifications from '../../../mixins/notifications'
import PeerReview from './PeerReview'

export default {
    mixins: [notifications],
    components: {PeerReview},
    props: ["reviewId"],
    data() {
        return {
            review: {
                review: {},
                form: {}
            },
            evaluation: {
                review: {},
                form: {}
            },
        }
    },
    computed: {
        evaluationExists() {
            return !!(this.evaluation && this.evaluation.review && this.evaluation.review.id)

        }
    },
    async created() {
        // Retrieve the review.
        await this.fetchReview()

        // Retrieve the evaluation.
        await this.fetchEvaluation()
    },
    methods: {
        async createEvaluation() {
            try {
                await api.ReviewEvaluation.create(this.review.review.id)
            } catch(e) {
                this.showErrorMessage({message: "Can't create a new evaluation, one already exists."})
            }
        },
        async fetchEvaluation() {
            try {
                const res = await api.ReviewEvaluation.get(this.review.review.id, true)
                this.evaluation = res.data
            } catch (e) {
                this.showErrorMessage({message: "Evaluation has not yet been made or can not be fetched."})
            }
        },
        async fetchReview() {
            // Retrieve the review.
            try {
                const res = await api.getPeerReview(this.reviewId)
                this.review = res.data
            } catch (e) {
                this.showErrorMessage({message: "Review could not be fetched."})
            }
        },
        async createEvaluationButton() {
            await this.createEvaluation()
            await this.fetchEvaluation()
        }
    }
}
</script>