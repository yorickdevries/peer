<template>
    <div>
        <b-form-group label="Question Number" description="The questions will be sorted on this number.">
            <b-form-input v-model="question.number" type="number" />
        </b-form-group>
        <b-form-group label="Question Text" description="The actual question that the student has to answer.">
            <b-form-textarea v-model="question.text" />
        </b-form-group>
        <b-form-group label="Range" description="Maximum stars a student can give.">
            <b-form-input v-model="question.range" type="number" />
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
                range: 10
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
                const res = await api.rangequestions.get(this.questionId)
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
            this.showSuccessMessage({ message: "Successfully saved range question." })
            this.$emit("questionSaved")
            await this.fetchQuestion()
        },
        async postQuestion() {
            await api.rangequestions.post(
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.questionnaireId,
                this.question.range
            )
        },
        async patchQuestion() {
            await api.rangequestions.patch(
                this.question.id,
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.range
            )
        },
        async deleteQuestion() {
            await api.rangequestions.delete(this.question.id)
            this.showSuccessMessage({ message: "Successfully deleted range question." })
            this.$emit("questionSaved")
            this.questionId = null
        }
    }
}
</script>
