<template>
    <div>
        <b-form-group label="Question Number" description="The questions will be sorted on this number.">
            <b-form-input v-model="question.number" type="number" />
        </b-form-group>
        <b-form-group label="Question Text" description="The actual question that the student has to answer.">
            <b-form-textarea v-model="question.text" />
        </b-form-group>
        <b-form-group label="Optional Question" description="Make this question optional for the student.">
            <b-form-checkbox v-model="question.optional"> Make this question optional. </b-form-checkbox>
        </b-form-group>
        <b-form-group label="Wordcount restrictions" description="Enable maximum or minimum wordcount.">
            <b-form-checkbox v-model="question.wordCount">
                Enable minimum and maximum wordcount restrictions.
            </b-form-checkbox>
        </b-form-group>
        <b-form-group
            label="Minimum Word Count"
            description="Minimum amount of words a student has to answer in."
            v-if="question.wordCount"
        >
            <b-form-input v-model="question.minWordCount" type="number"></b-form-input>
        </b-form-group>
        <b-form-group
            label="Maximum Word Count"
            description="Maximum amount of words a student has to answer in."
            v-if="question.wordCount"
        >
            <b-form-input v-model="question.maxWordCount" type="number"></b-form-input>
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
                wordCount: false,
                maxWordCount: 200000,
                minWordCount: 1,
            },
        }
    },
    async created() {
        await this.fetchQuestion()
    },
    methods: {
        async fetchQuestion() {
            // load the question in case an id is passed
            if (this.questionId) {
                const res = await api.openquestions.get(this.questionId)
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
            this.showSuccessMessage({ message: "Successfully saved open question." })
            this.$emit("questionSaved")
            await this.fetchQuestion()
        },
        async postQuestion() {
            await api.openquestions.post(
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.questionnaireId,
                this.question.maxWordCount,
                this.question.minWordCount
            )
            console.log("posted question")
        },
        async patchQuestion() {
            await api.openquestions.patch(
                this.question.id,
                this.question.text,
                this.question.number,
                this.question.optional,
                this.question.maxWordCount,
                this.question.minWordCount
            )
        },
        async deleteQuestion() {
            await api.openquestions.delete(this.question.id)
            this.showSuccessMessage({ message: "Successfully deleted open question." })
            this.$emit("questionSaved")
            this.questionId = null
        },
    },
}
</script>
