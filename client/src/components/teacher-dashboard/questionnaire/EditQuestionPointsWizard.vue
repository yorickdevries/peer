<template>
    <b-card :header="`Edit Question Points ${question.number}`">
        <template v-if="question.type === 'multiplechoice' || question.type === 'checkbox'">
            <OptionPoints
                :questionId="question.id"
                @questionSaved="questionSaved"
                :questionType="question.type"
            ></OptionPoints>
        </template>

        <template v-else>
            Changing points is not possible.
        </template>
    </b-card>
</template>

<script>
import notifications from "../../../mixins/notifications"
import OptionPoints from "./points/OptionPoints"
export default {
    mixins: [notifications],
    components: {
        OptionPoints
    },
    props: ["question"],
    methods: {
        questionSaved() {
            // emit so the questionnaire is reloaded
            this.$emit("questionSaved")
        }
    }
}
</script>

<style></style>
