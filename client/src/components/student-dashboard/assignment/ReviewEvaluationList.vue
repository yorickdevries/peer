<template>
    <div>
        Lorem ipsum.
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
            // Peer reviews from others to you.
            peerReviews: []
        }
    },
    computed: {
        noReviews() {
            return this.reviews.length === 0
        }
    },
    async created() {
        // Retrieve reviews given to you.
        const {data: receivedIds} = await api.getFeedbackOfAssignment(this.$route.params.assignmentId)
        const receivedFlatIds = receivedIds.map(value => value.id)

        this.peerReviews = await this.foreignKeyJoinOfPeerReviews(receivedFlatIds)
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
    }
}

</script>

<style scoped>

</style>