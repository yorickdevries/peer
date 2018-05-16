<template>
    <div>
        <b-container fluid class="">
            <b-row>

                <!--Side-bar for peer reviews-->
                <b-col class="pl-0">
                    <b-card no-body>
                        <b-card-body>
                            <div class="text-muted">Questions</div>
                            <div>Question #1  </div>
                            <div>Question #2  </div>
                            <div>Question #3  </div>
                        </b-card-body>
                    </b-card>
                </b-col>

                <!--Peer Review Assesement-->
                <b-col cols="9" class="pr-0">
                    <FeedbackSingle></FeedbackSingle>
                </b-col>

            </b-row>
        </b-container>
    </div>
</template>

<script>
import FeedbackSingle from './Feedback'

export default {
    components: {
        FeedbackSingle
    }
}
</script>
