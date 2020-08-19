<template>
    <b-card :header="`Edit Question ${question.number}`">
        <template v-if="question.type === 'open'">
            <OpenQuestion :questionId="question.id" @questionSaved="questionSaved"></OpenQuestion>
        </template>

        <template v-if="question.type === 'multiplechoice'">
            <MultipleChoiceQuestion :questionId="question.id" @questionSaved="questionSaved"></MultipleChoiceQuestion>
        </template>

        <template v-if="question.type === 'checkbox'">
            <CheckboxQuestion :questionId="question.id" @questionSaved="questionSaved"></CheckboxQuestion>
        </template>

        <template v-if="question.type === 'range'">
            <RangeQuestion :questionId="question.id" @questionSaved="questionSaved"></RangeQuestion>
        </template>

        <template v-if="question.type === 'upload'">
            <UploadQuestion :questionId="question.id" @questionSaved="questionSaved"></UploadQuestion>
        </template>
    </b-card>
</template>

<script>
import notifications from "../../../mixins/notifications"
import OpenQuestion from "./OpenQuestion"
import MultipleChoiceQuestion from "./MultipleChoiceQuestion"
import CheckboxQuestion from "./CheckboxQuestion"
import RangeQuestion from "./RangeQuestion"
import UploadQuestion from "./UploadQuestion"

export default {
    mixins: [notifications],
    components: {
        OpenQuestion,
        MultipleChoiceQuestion,
        CheckboxQuestion,
        RangeQuestion,
        UploadQuestion
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
