<template>
    <div>
        <b-form-group label="Question Number" description="The questions will be sorted on this number.">
            <b-form-input v-model="question.number" type="number" />
        </b-form-group>
        <b-form-group label="Question Text" description="The actual question that the student has to answer.">
            <b-form-textarea v-model="question.text" />
        </b-form-group>
        <b-form-checkbox id="is-graded-checkbox" v-model="question.graded" name="is-graded-checkbox">
            Grade answers
        </b-form-checkbox>
        <b-form-group
            label="Multiple Choice Options"
            description="Delete, edit and add multiple choice options here. Make sure to save."
        >
            <template v-for="(option, index) in question.options">
                <b-form :key="index">
                    <div class="input-group mb-2">
                        <b-form-input v-model="option.text" :disabled="option.delete"></b-form-input>
                        <div class="input-group-append">
                            <b-button
                                v-if="!option.delete"
                                @click="markOptionforDeletion(option)"
                                variant="danger"
                                size="sm"
                                >Delete
                            </b-button>
                            <b-button @click="option.delete = false" v-else variant="secondary" size="sm"
                                >Undo
                            </b-button>
                            <b-form-input
                                :id="`option-${index}`"
                                v-if="question.graded && !option.delete"
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
                        <b-alert
                            :show="question.graded && !option.delete && !gradeIsOk(option.points)"
                            variant="danger"
                            dismissible
                        >
                            Number must be in range of -1 and 1, and have up to 2 decimal points!
                        </b-alert>
                    </div>
                </b-form>
            </template>
            <b-button @click="addEmptyOption" variant="success" size="sm">Add new option</b-button>
        </b-form-group>
        <b-form-group label="Optional Question" description="Make this question optional for the student.">
            <b-form-checkbox v-model="question.optional">
                Make this question optional.
            </b-form-checkbox>
        </b-form-group>
        <b-button
            @click="save"
            :variant="allGradedOptionsOk ? 'outline-primary' : 'outline-light'"
            :disabled="!allGradedOptionsOk"
            size="sm"
            class="mr-1"
            >Save</b-button
        >
        <span v-if="question.id">
            <b-btn v-b-modal="`delete${question.id}`" variant="outline-danger" size="sm">Delete</b-btn>
            <b-modal :id="`delete${question.id}`" centered title="Warning" @ok="deleteQuestion">
                Are you sure you want to delete? <br /><br />
                Deleting a question after students have submitted answers to this question will DELETE all the answers
                the students have given.
            </b-modal>
        </span>
    </div>
</template>

<script>
import api from "../../../api/api"
import _ from "lodash"
import notifications from "../../../mixins/notifications"

export default {
    mixins: [notifications],
    props: ["questionId", "questionnaireId", "questionNumber"],
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
            }
        }
    },
    async created() {
        await this.fetchQuestion()
    },
    computed: {
        allGradedOptionsOk() {
            if (!this.question.graded) return true
            for (const option of this.question.options) {
                if (!this.gradeIsOk(option.points)) {
                    return false
                }
            }
            return true
        }
    },
    watch: {
        "question.graded": {
            handler: function(toGrade) {
                const questionOptions = this.question.options
                this.question.options = questionOptions.map(option => {
                    const { id, text, points } = option
                    return toGrade ? { id, text, points: points || 0 } : { id, text }
                })
            }
        }
    },
    methods: {
        gradeIsOk(currentValue) {
            if (currentValue === "" || currentValue === undefined || currentValue === null) {
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
        async fetchQuestion() {
            // load the question in case an id is passed
            if (this.questionId) {
                const res = await api.multiplechoicequestions.get(this.questionId)
                let loadedQuestion = res.data
                if (loadedQuestion.graded) {
                    const formattedQuestion = this.formatGradedOptions(loadedQuestion.options)
                    loadedQuestion.options = formattedQuestion
                }
                this.question = loadedQuestion
            } else {
                // only add empty options when the question is not fetched from the database
                this.addEmptyOption()
                this.addEmptyOption()
            }
        },
        formatGradedOptions(options) {
            return options.map(option => {
                const decimals = option.points / 100
                return { id: option.id, text: option.text, points: decimals }
            })
        },
        addEmptyOption() {
            const optionPrototype = this.question.graded ? { text: "", points: 0 } : { text: "" }
            this.question.options.push(optionPrototype)
        },
        markOptionforDeletion(option) {
            if (!option.id) {
                // just remove it as the question isnt saved to the database yet
                this.question.options = _.without(this.question.options, option)
            } else {
                // Mark a option as to be deleted
                // this syntax is used as it will not be reactive otherwise
                this.$set(option, "delete", true)
            }
        },
        async save() {
            // patch in case the id is defined
            if (this.question.id) {
                await this.patchQuestion()
            } else {
                await this.postQuestion()
            }
            this.showSuccessMessage({ message: "Successfully saved multiplechoice question." })
            this.$emit("questionSaved")
            await this.fetchQuestion()
        },
        async postQuestion() {
            const res = await api.multiplechoicequestions.post(
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.questionnaireId,
                this.question.graded
            )
            for (const option of this.question.options) {
                try {
                    await api.multiplechoicequestionoptions.post(option, res.data.id)
                    this.showSuccessMessage({ message: "Successfully created multiple choice question option." })
                } catch {
                    this.showErrorMessage({ message: "failed to create multiple choice question option." })
                }
            }
        },
        async patchQuestion() {
            await api.multiplechoicequestions.patch(
                this.question.id,
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.graded
            )
            for (const option of this.question.options) {
                try {
                    if (option.id) {
                        if (option.delete) {
                            // delete it the boolean is set
                            await api.multiplechoicequestionoptions.delete(option.id)
                        } else {
                            // just patch the option text
                            await api.multiplechoicequestionoptions.patch(option, option.id)
                        }
                    } else {
                        // create the option
                        await api.multiplechoicequestionoptions.post(option, this.question.id)
                    }
                    this.showSuccessMessage({ message: "Successfully saved multiple choice question option." })
                } catch {
                    this.showErrorMessage({ message: "failed to save multiple choice question option." })
                }
            }
        },
        async deleteQuestion() {
            // delete all options
            for (const option of this.question.options) {
                if (option.id) {
                    await api.multiplechoicequestionoptions.delete(option.id)
                }
            }
            await api.multiplechoicequestions.delete(this.question.id)
            this.showSuccessMessage({ message: "Successfully deleted multiplechoice question." })
            this.$emit("questionSaved")
        }
    }
}
</script>
