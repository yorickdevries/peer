<template>
    <div>
        <b-form-group label="Question Number" description="The questions will be sorted on this number.">
            <b-form-input type="number" v-model="question.number" />
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
    </div>
</template>

<script>
export default {
    props: ["value"],
    data() {
        return {
            question: this.value
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
