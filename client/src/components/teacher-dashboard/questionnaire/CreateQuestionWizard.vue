<template>
    <b-card header="Create new Question">
        <b-form-group label="Question Type" description="Choose from on the question types.">
            <b-form-select :options="questionTypes" v-model="selectedType"></b-form-select>
        </b-form-group>

        <template v-if="selectedType === 'open'">
            <OpenQuestion
                :questionnaireId="questionnaireId"
                :questionNumber="questionNumber"
                @questionSaved="questionSaved"
            ></OpenQuestion>
        </template>

        <template v-if="selectedType === 'multiplechoice'">
            <MultipleChoiceQuestion
                :questionnaireId="questionnaireId"
                :questionNumber="questionNumber"
                @questionSaved="questionSaved"
            ></MultipleChoiceQuestion>
        </template>

        <template v-if="selectedType === 'checkbox'">
            <CheckboxQuestion
                :questionnaireId="questionnaireId"
                :questionNumber="questionNumber"
                @questionSaved="questionSaved"
            ></CheckboxQuestion>
        </template>

        <template v-if="selectedType === 'range'">
            <RangeQuestion
                :questionnaireId="questionnaireId"
                :questionNumber="questionNumber"
                @questionSaved="questionSaved"
            ></RangeQuestion>
        </template>

        <template v-if="selectedType === 'upload'">
            <UploadQuestion
                :questionnaireId="questionnaireId"
                :questionNumber="questionNumber"
                @questionSaved="questionSaved"
            ></UploadQuestion>
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
    props: ["questionnaireId", "questionNumber"],
    data() {
        return {
            selectedType: "",
            questionTypes: [
                { value: "open", text: "Open" },
                { value: "multiplechoice", text: "Multiple Choice" },
                { value: "checkbox", text: "Checkbox" },
                { value: "range", text: "Range" },
                { value: "upload", text: "Upload" }
            ]
        }
    },
    methods: {
        questionSaved() {
            // reset fields and emit so the questionnaire is reloaded
            this.selectedType = ""
            this.$emit("questionSaved")
        }
    }
}
</script>
