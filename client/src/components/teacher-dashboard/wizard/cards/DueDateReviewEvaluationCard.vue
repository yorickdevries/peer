<template>
    <DatePickerCardTemplate
        :title="'Select the due date and time for review evaluation(s)'"
        :isDisabled="isEvalDisabled"
        @next-card="nextCard"
        @prev-card="prevCard"
        @date-pick="setEvalDueDate"
        @time-pick="setEvalDueTime"
    >
        <b-form-checkbox class="checkboxes" v-model="allowLateEvals" :disabled="isEvalDisabled" @input="setLateEvals">
            Allow late review evaluations indefinitely after the deadline
        </b-form-checkbox>
        <b-form-checkbox class="checkboxes" v-model="isEvalDisabled" @input="setEvalDisabled">
            I don't want to enable review evaluations</b-form-checkbox
        >
    </DatePickerCardTemplate>
</template>

<script>
import DatePickerCardTemplate from "@/components/teacher-dashboard/wizard/cards/DatePickerCardTemplate.vue"
import Cards from "@/mixins/cards"

export default {
    name: "DueDateReviewEvaluation",
    components: { DatePickerCardTemplate },
    mixins: [Cards],
    props: ["assignment"],
    data() {
        return {
            allowLateEvals: false,
            isEvalDisabled: false,
        }
    },
    methods: {
        setEvalDueDate(date) {
            this.assignment.reviewEvaluationDueDay = date
        },
        setEvalDueTime(time) {
            this.assignment.reviewEvaluationDueTime = time
        },
        setLateEvals() {
            this.assignment.lateReviewEvaluations = !this.assignment.lateReviewEvaluations
        },
        setEvalDisabled() {
            this.assignment.reviewEvaluation = !this.assignment.reviewEvaluation
        },
    },
}
</script>

<style scoped>
.checkboxes {
    margin-top: 1rem;
    align-self: flex-start;
}
</style>
