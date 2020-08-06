<template>
    <div>
        <b-form-group label="Question Number" description="The questions will be sorted on this number.">
            <b-form-input type="number" v-model="question.number" />
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
    </div>
</template>

<script>
export default {
    props: ["value"],
    data() {
        return {
            question: this.value,
            extensionTypes: [
                { value: ".pdf", text: ".pdf" },
                { value: ".zip", text: ".zip" },
                { value: ".doc,.docx", text: ".doc,.docx" },
                { value: ".pdf,.zip,.doc,.docx", text: ".pdf,.zip,.doc,.docx" }
            ]
        }
    },
    watch: {
        question(val) {
            this.$emit("input", val)
        },
        value(val) {
            this.question = val
        }
    }
}
</script>
