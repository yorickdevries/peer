<template>
    <div>
        <b-form-group label="Question Number" description="The questions will be sorted on this number.">
            <b-form-input v-model="question.number" type="number" />
        </b-form-group>
        <b-form-group label="Question Text" description="The actual question that the student has to answer.">
            <b-form-textarea v-model="question.text" />
        </b-form-group>
        <b-form-group label="Allowed file extension" description="The extension of the file type that is allowed.">
            <b-form-select :options="extensionTypes" v-model="question.extensions"></b-form-select>
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
                extensions: ""
            },
            extensionTypes: [
                { value: ".pdf", text: ".pdf" },
                { value: ".zip", text: ".zip" },
                { value: ".pdf,.zip", text: ".pdf,.zip" },
                { value: ".doc,.docx", text: ".doc,.docx" },
                { value: ".pdf,.zip,.doc,.docx", text: ".pdf,.zip,.doc,.docx" }
            ]
        }
    },
    async created() {
        await this.fetchQuestion()
    },
    methods: {
        async fetchQuestion() {
            // load the question in case an id is passed
            if (this.questionId) {
                const res = await api.uploadquestions.get(this.questionId)
                this.question = res.data
            }
        },
        async save() {
            // patch in case the id is defined
            if (this.question.id) {
                await this.patchQuestion()
            } else {
                await this.postQuestion()
            }
            this.showSuccessMessage({ message: "Successfully saved upload question." })
            this.$emit("questionSaved")
            await this.fetchQuestion()
        },
        async postQuestion() {
            await api.uploadquestions.post(
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.questionnaireId,
                this.question.extensions
            )
        },
        async patchQuestion() {
            await api.uploadquestions.patch(
                this.question.id,
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.extensions
            )
        },
        async deleteQuestion() {
            await api.uploadquestions.delete(this.question.id)
            this.showSuccessMessage({ message: "Successfully deleted upload question." })
            this.$emit("questionSaved")
        }
    }
}
</script>
