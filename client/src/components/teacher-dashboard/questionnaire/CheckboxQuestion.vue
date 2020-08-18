<template>
    <div>
        <b-form-group label="Question Number" description="The questions will be sorted on this number.">
            <b-form-input v-model="question.number" type="number" />
        </b-form-group>
        <b-form-group label="Question Text" description="The actual question that the student has to answer.">
            <b-form-textarea v-model="question.text" />
        </b-form-group>
        <b-form-group
            label="Multiple Choice Options"
            description="Delete, edit and add checkbox options here. Make sure to save."
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
                        </div>
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
        <b-button @click="save" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
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
                options: []
            }
        }
    },
    async created() {
        await this.fetchQuestion()
    },
    methods: {
        async fetchQuestion() {
            // load the question in case an id is passed
            if (this.questionId) {
                const res = await api.checkboxquestions.get(this.questionId)
                this.question = res.data
            } else {
                // only add empty options when the question is not fetched from the database
                this.addEmptyOption()
                this.addEmptyOption()
            }
        },
        addEmptyOption() {
            this.question.options.push({ text: "" })
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
            this.showSuccessMessage({ message: "Successfully saved checkbox question." })
            this.$emit("questionSaved")
            await this.fetchQuestion()
        },
        async postQuestion() {
            const res = await api.checkboxquestions.post(
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.questionnaireId
            )
            // save options as well
            this.questionId = res.data.id
            for (const option of this.question.options) {
                try {
                    await api.checkboxquestionoptions.post(option.text, this.questionId)
                    this.showSuccessMessage({ message: "Successfully created checkbox question option." })
                } catch {
                    this.showErrorMessage({ message: "failed to create checkbox question option." })
                }
            }
        },
        async patchQuestion() {
            await api.checkboxquestions.patch(
                this.question.id,
                this.question.text,
                this.question.number,
                this.question.optional
            )
            for (const option of this.question.options) {
                try {
                    if (option.id) {
                        if (option.delete) {
                            // delete it the boolean is set
                            await api.checkboxquestionoptions.delete(option.id)
                        } else {
                            // just patch the option text
                            await api.checkboxquestionoptions.patch(option.text, option.id)
                        }
                    } else {
                        // create the option
                        await api.checkboxquestionoptions.post(option.text, this.question.id)
                    }
                    this.showSuccessMessage({ message: "Successfully saved checkbox question option." })
                } catch {
                    this.showErrorMessage({ message: "failed to save checkbox question option." })
                }
            }
        },
        async deleteQuestion() {
            // delete all options
            for (const option of this.question.options) {
                if (option.id) {
                    await api.checkboxquestionoptions.delete(option.id)
                }
            }
            await api.checkboxquestions.delete(this.question.id)
            this.showSuccessMessage({ message: "Successfully deleted checkbox question." })
            this.$emit("questionSaved")
            this.questionId = null
        }
    }
}
</script>
