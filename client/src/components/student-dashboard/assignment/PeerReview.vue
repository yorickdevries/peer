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
                <h6 class="card-subtitle text-muted">Give the peer review to one of your peers here.</h6>
            </b-card-body>

            <b-list-group flush>
                <b-list-group-item>
                    <div class="mb-2 bottom-right">
                        <h5 class="text-primary">Question 1 of 3.</h5>
                        <p>
                            How well has the author done?
                        </p>
                        <b-form-textarea id="textarea1"
                                         v-model="text"
                                         placeholder="Enter something"
                                         :rows="3"
                                         :max-rows="6" />
                    </div>
                </b-list-group-item>

                <b-list-group-item>
                    <div class="mb-2 bottom-right">
                        <h5 class="text-primary">Question 2 of 3.</h5>
                        <span class="mb-2">
                            Rate the work.
                        </span>
                        <div>
                        <StarRating
                                class="align-middle"
                                :border-color="'#007bff'"
                                :active-color="'#007bff'"
                                :border-width="2"
                                :item-size="20"
                                :spacing="5"
                                inline
                                :max-rating="7"
                                :show-rating="false"
                                v-model="rating"/>
                            <span class="align-middle ml-2 small">{{ rating }}</span>
                        </div>

                    </div>
                </b-list-group-item>

                <b-list-group-item>
                    <div class="mb-2 bottom-right">
                        <h5 class="text-primary">Question 3 of 3.</h5>
                        <span class="mb-2">
                            What do you agree with?
                        </span>
                        <b-form-group>
                            <b-form-radio-group v-model="selected"
                                                :options="options"
                                                stacked>
                            </b-form-radio-group>
                        </b-form-group>
                    </div>
                </b-list-group-item>

            </b-list-group>
            <b-card-body>
                <b-button variant="success float-right">Submit Review</b-button>
            </b-card-body>
        </b-card>

    </div>
</template>

<script>
import { StarRating } from 'vue-rate-it';

export default {
    props: ['peer_review_id'],
    async mounted() {

        // Get peer review.
        this.peerSubmission = {
            id: this.$route.params.peer_review_id,
            download_link: "sample"
        }
    },
    data() {
        return {
            text: "",
            rating: null,
            options: [
                { text: 'First radio', value: 'first' },
                { text: 'Second radio', value: 'second' },
                { text: 'Third radio', value: 'third' }
            ],
            selected: null,
            peerSubmission: {
                id: 2,
                download_link: null,
            },
            rubric: [
                {
                    question_number: "1",
                    type: "text",
                    question: "How well has the author done?"
                }
            ]
        }
    },
    components: {
        StarRating
    }
}
</script>