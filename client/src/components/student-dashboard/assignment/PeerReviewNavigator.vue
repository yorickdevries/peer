<template>
    <div>
        <b-container fluid class="">
            <b-row>

                <!--Side-bar for peer reviews-->
                <b-col class="pl-0">
                    <b-card no-body>
                        <b-card-body>
                            <div class="text-muted">Assignments</div>
                            <div>Peer #1  <b-badge class="float-right" variant="danger">TODO</b-badge></div>
                            <div>Peer #2  <b-badge class="float-right" variant="danger">TODO</b-badge></div>
                            <div>Peer #3  <b-badge class="float-right" variant="success">DONE</b-badge></div>
                        </b-card-body>
                    </b-card>
                </b-col>

                <!--Peer Review Assesement-->
                <b-col cols="9" class="pr-0">
                    <component :is="selected"></component>
                </b-col>

            </b-row>
        </b-container>
    </div>
</template>

<script>
import PeerReviewSingle from './PeerReview'

export default {
    data() {
        return {
            peerReviews: [
                PeerReviewSingle,
                PeerReviewSingle,
                PeerReviewSingle
            ],
            current: PeerReviewSingle
        }
    },
    computed: {
        selected() {
            return this.peerReviews[0]
        }
    }
}
</script>
