<template>
    <div>
        <b-card v-if="noReviews">No reviews available.</b-card>

        <b-card v-else no-body>

            <b-tabs card>
                <b-tab v-for="(review, index) in reviews">
                    <template slot="title">
                        <div class="d-flex align-items-center">
                            <b-badge v-if="review.done" variant="success" class="mr-2">DONE</b-badge>
                            <b-badge v-if="!review.done" variant="danger" class="mr-2">DUE</b-badge>
                            <span>Review {{ index + 1 }}</span>
                        </div>
                    </template>

                    <PeerReview :reviewId="review.id"></PeerReview>
                </b-tab>
            </b-tabs>

        </b-card>

    </div>
</template>

<script>
    import PeerReview from './PeerReview'
    import api from "../../../api"

    export default {
        components: {
            PeerReview
        },
        data() {
            return {
                reviews: []
            }
        },
        computed: {
            noReviews() {
                return this.reviews.length === 0
            }
        },
        async created() {
            await this.fetchMetaReviews()
        },
        methods: {
            async fetchMetaReviews() {
                let {data} = await api.getAssignmentReviews(this.$route.params.assignmentId)
                this.reviews = data
            }
        }
    }

</script>

<style scoped>

</style>