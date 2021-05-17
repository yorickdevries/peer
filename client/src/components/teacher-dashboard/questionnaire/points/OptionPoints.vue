<template>
    <div>
        <b-form-group label="Question" label-class="font-weight-bold pt-0" label-size="lg">
            {{ question.text }}
        </b-form-group>
        <b-form-group
            :label="`${questionType === 'multiplechoice' ? 'Multiple Choice' : 'Checkbox'} Options`"
            label-class="font-weight-bold pt-0"
            label-size="lg"
            description="Edit points for the options here. Make sure to save."
        >
            <template v-for="(option, index) in question.options">
                <b-form :key="index">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <b-input-group-text>{{ option.text }}</b-input-group-text>
                        </div>
                        <div class="input-group-append">
                            <b-form-input
                                :id="`option-${index}`"
                                v-model="option.points"
                                type="number"
                                :state="gradeIsOk(option.points)"
                                :min="-1"
                                :max="1"
                                :step="0.01"
                                required
                            >
                            </b-form-input>
                        </div>
                        <b-alert :show="!gradeIsOk(option.points)" variant="danger" dismissible>
                            Number must be in range of -1 and 1, and have up to 2 decimal points!
                        </b-alert>
                    </div>
                </b-form>
            </template>
        </b-form-group>
        <b-button
            @click="save"
            :variant="allGradedOptionsOk ? 'outline-primary' : 'outline-light'"
            :disabled="!allGradedOptionsOk"
            size="sm"
            class="mr-1"
            >Save</b-button
        >
    </div>
</template>

<script>
import api from "../../../../api/api"
import notifications from "../../../../mixins/notifications"

export default {
    mixins: [notifications],
    props: ["questionId", "questionnaireId", "questionNumber", "questionType"],
    computed: {
        allGradedOptionsOk() {
            // check all grades are in -1 to 1 range and have at maximum 2 decimal points
            if (!this.question.graded) return true
            for (const option of this.question.options) {
                if (!this.gradeIsOk(option.points)) {
                    return false
                }
            }
            return true
        }
    },
    data() {
        return {
            // default question, can be replaced when a questionId is passed
            question: {
                text: "",
                number: this.questionNumber,
                optional: false,
                questionnaireId: this.questionnaireId,
                options: [],
                graded: false
            },
        }
    },
    async created() {
        await this.fetchQuestion()
        this.formatOptions()
    },
    methods: {
        gradeIsOk(currentValue) {
            // check if grade is in -1 to 1 range and has at maximum 2 decimal points
            if (currentValue === "" || currentValue == null) {
                return false
            }
            const stringifiedNumber = String(currentValue)
            const numberStrArr = stringifiedNumber.split(".")
            if (currentValue > 1 || currentValue < -1) {
                return false
            } else if (numberStrArr.length > 2) {
                return false
            } else if (numberStrArr.length === 2 && numberStrArr[1].length > 2) {
                return false
            } else {
                return true
            }
        },
        formatOptions() {
            const questionOptions = this.question.options
            this.question.options = questionOptions.map(option => {
                const { id, text, points } = option
                return { id, text, points: points || 0 }
            })
        },
        async fetchQuestion() {
            // load the question in case an id is passed
            if (this.questionId) {
                const questionObject =
                    this.questionType === "multiplechoice" ? api.multiplechoicequestions : api.checkboxquestions
                const res = await questionObject.get(this.questionId)
                let loadedQuestion = res.data
                const formattedQuestion = this.formatGradedOptions(loadedQuestion.options)
                loadedQuestion.options = formattedQuestion
                this.question = loadedQuestion
            }
        },
        formatGradedOptions(options) {
            return options.map(option => {
                const decimals = option.points / 100
                return { id: option.id, text: option.text, points: decimals }
            })
        },
        async save() {
            // patch in case the id is defined
            if (this.question.id) {
                await this.patchQuestionOptions()
            }
            const message = `Successfully edited ${
                this.questionType === "multiplechoice" ? "multiple choice" : "checkbox"
            } question points.`
            this.showSuccessMessage({ message })
            this.$emit("questionSaved")
            await this.fetchQuestion()
        },
        async patchQuestionOptions() {
            const questionOptionType =
                this.questionType === "multiplechoice" ? api.multiplechoicequestionoptions : api.checkboxquestionoptions
            for (const option of this.question.options) {
                try {
                    if (option.id) {
                        // just patch the option text
                        await questionOptionType.patch(option.text, option.points, option.id)
                        const message = `Successfully edited ${
                            this.questionType === "multiplechoice" ? "multiple choice" : "checkbox"
                        } question option points.`
                        this.showSuccessMessage({ message })
                    }
                } catch {
                    const message = `Failed to edit ${
                        this.questionType === "multiplechoice" ? "multiple choice" : "checkbox"
                    } question option points.`
                    this.showErrorMessage({ message })
                }
            }
        }
    }
}
</script>
