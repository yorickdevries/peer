<template>
    <b-card header="Create new Question">
        <b-form-group label="Question Type" description="Choose from on the question types.">
            <b-form-select :options="questionTypes" v-model="selectedType"></b-form-select>
        </b-form-group>

        <template v-if="selectedType === 'open'">
            <OpenQuestion v-model="openQuestion"></OpenQuestion>
            <b-button
                @click="createQuestion(openQuestion, selectedType)"
                variant="outline-primary"
                size="sm"
                class="mr-1"
                >Save</b-button
            >
        </template>

        <template v-if="selectedType === 'range'">
            <RangeQuestion v-model="rangeQuestion"></RangeQuestion>
            <b-button
                @click="createQuestion(rangeQuestion, selectedType)"
                variant="outline-primary"
                size="sm"
                class="mr-1"
                >Save</b-button
            >
        </template>

        <template v-if="selectedType === 'mc'">
            <MCQuestion v-model="mcQuestion"></MCQuestion>
            <b-button @click="createQuestion(mcQuestion, selectedType)" variant="outline-primary" size="sm" class="mr-1"
                >Save</b-button
            >
        </template>

        <template v-if="selectedType === 'checkbox'">
            <CheckboxQuestion v-model="checkboxQuestion"></CheckboxQuestion>
            <b-button
                @click="createQuestion(checkboxQuestion, selectedType)"
                variant="outline-primary"
                size="sm"
                class="mr-1"
                >Save</b-button
            >
        </template>

        <template v-if="selectedType === 'upload'">
            <UploadQuestion v-model="uploadQuestion"></UploadQuestion>
            <b-button
                @click="createQuestion(uploadQuestion, selectedType)"
                variant="outline-primary"
                size="sm"
                class="mr-1"
                >Save</b-button
            >
        </template>
    </b-card>
</template>

<script>
import OpenQuestion from "./OpenQuestion"
import RangeQuestion from "./RangeQuestion"
import UploadQuestion from "./UploadQuestion"
import MCQuestion from "./MCQuestion"
import CheckboxQuestion from "./CheckboxQuestion"
import api from "../../../api/api_temp"
import notifications from "../../../mixins/notifications"

let apiPrefixes = {
    open: "/openquestions/",
    range: "/rangequestions",
    mc: "/multiplechoicequestions",
    mcoption: "/multiplechoicequestionoptions",
    checkbox: "/checkboxquestions",
    checkboxoption: "/checkboxquestionoptions",
    upload: "/uploadquestions"
}

export default {
    mixins: [notifications],
    components: {
        OpenQuestion,
        RangeQuestion,
        MCQuestion,
        CheckboxQuestion,
        UploadQuestion
    },
    props: ["id", "rubricId", "nextNewQuestionNumber"],
    data() {
        return {
            selectedType: "",
            questionTypes: [
                { value: "mc", text: "Multiple Choice" },
                { value: "checkbox", text: "Checkbox" },
                { value: "range", text: "Range" },
                { value: "open", text: "Open" },
                { value: "upload", text: "Upload Question" }
            ],
            openQuestion: {
                text: "",
                questionnaireId: this.rubricId,
                number: null,
                optional: false
            },
            rangeQuestion: {
                text: "",
                range: null,
                questionnaireId: this.rubricId,
                number: null,
                optional: false
            },
            mcQuestion: {
                text: "",
                questionnaireId: this.rubricId,
                number: null,
                options: [],
                optional: false
            },
            checkboxQuestion: {
                text: "",
                questionnaireId: this.rubricId,
                number: null,
                options: [],
                optional: false
            },
            uploadQuestion: {
                text: "",
                questionnaireId: this.rubricId,
                number: null,
                extensions: null,
                optional: false
            }
        }
    },
    watch: {
        rubricId(val) {
            this.openQuestion.questionnaireId = val
            this.rangeQuestion.questionnaireId = val
            this.mcQuestion.questionnaireId = val
            this.checkboxQuestion.questionnaireId = val
            this.uploadQuestion.questionnaireId = val
        },
        nextNewQuestionNumber(val) {
            this.openQuestion.number = val
            this.rangeQuestion.number = val
            this.mcQuestion.number = val
            this.checkboxQuestion.number = val
            this.uploadQuestion.number = val
        }
    },
    created() {
        this.onReset()
    },
    methods: {
        async createQuestion(question, type) {
            // Special function to create MC question.
            if (type === "mc") return this.createQuestionWithOptions(question, type)
            // Special function to create Checkbox question.
            if (type === "checkbox") return this.createQuestionWithOptions(question, type)

            try {
                await api.client.post(`${apiPrefixes[type]}`, question)
                this.showSuccessMessage({ message: "Successfully created question." })
                this.$emit("saved")
                this.onReset()
            } catch (e) {
                this.showErrorMessage({ message: e.response.data })
            }
        },
        async createQuestionWithOptions(question, type) {
            try {
                // Create the MC question itself.
                let res = await api.client.post(`${apiPrefixes[type]}`, {
                    text: question.text,
                    questionnaireId: question.questionnaireId,
                    number: question.number,
                    optional: question.optional
                })

                // Get the newly created ID of the MC question.
                let parentQuestionId = res.data.id

                // Create all the options.
                let options = question.options
                if (type === "mc") {
                    for (const option of options) {
                        await api.client.post(`${apiPrefixes["mcption"]}`, {
                            text: option.text,
                            multipleChoiceQuestionId: parentQuestionId
                        })
                    }
                } else if (type === "checkbox") {
                    for (const option of options) {
                        await api.client.post(`${apiPrefixes["checkboxoption"]}`, {
                            text: option.text,
                            checkboxQuestionId: parentQuestionId
                        })
                    }
                }

                this.showSuccessMessage({ message: "Successfully created question." })
                this.$emit("saved")
                this.onReset()
            } catch (e) {
                this.showErrorMessage({ message: e.response.data })
            }
        },
        onReset() {
            this.selectedType = ""
            this.openQuestion = {
                text: "",
                questionnaireId: this.rubricId,
                number: this.nextNewQuestionNumber,
                optional: false
            }
            this.rangeQuestion = {
                text: "",
                range: null,
                questionnaireId: this.rubricId,
                number: this.nextNewQuestionNumber,
                optional: false
            }
            ;(this.mcQuestion = {
                text: "",
                questionnaireId: this.rubricId,
                number: this.nextNewQuestionNumber,
                options: [],
                optional: false
            }),
                (this.checkboxQuestion = {
                    text: "",
                    questionnaireId: this.rubricId,
                    number: this.nextNewQuestionNumber,
                    options: [],
                    optional: false
                })
            this.uploadQuestion = {
                text: "",
                questionnaireId: this.rubricId,
                number: this.nextNewQuestionNumber,
                extensions: null,
                optional: false
            }
        }
    }
}
</script>
