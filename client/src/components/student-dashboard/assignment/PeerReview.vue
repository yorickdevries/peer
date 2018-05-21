<template>
    <div>

        <!--Title Card with Download Button-->
        <b-card no-body>
            <b-card-body>
                <b-container fluid class="px-0">
                    <b-row>
                        <b-col>
                            <span class="text-muted">You are giving feedback to</span><br>
                            <span class="lead">Peer #{{ peerSubmission.id }}</span>
                        </b-col>
                        <b-col>
                            <b-button variant="success w-100 h-100">Download Hand-In</b-button>
                        </b-col>
                    </b-row>
                </b-container>
            </b-card-body>
        </b-card>

        <b-card no-body class="mt-3">
            <b-card-body>
                <h4>Assignment Criteria</h4>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Question 1 of 1.</h5>
                    <p>
                        How well has the author done?
                    </p>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6" />
                </div>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Question 2 of 2.</h5>
                    <p>
                        How well has the author done?
                    </p>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6" />
                </div>


                <b-button variant="success float-right">Submit Review</b-button>

            </b-card-body>
        </b-card>

    </div>
</template>

<script>
export default {
    props: ['peer_review_id'],
    async mounted() {
        console.log(this.peer_review_id)

        this.peerSubmission = {
            id: this.$route.params.peer_review_id,
            download_link: "sample"
        }
    },
    data() {
        return {
            text: "",
            peerSubmission: {
                id: 2,
                download_link: null,
            }
        }
    }
}
</script>