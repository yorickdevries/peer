<template>
    <DatePickerCardTemplate
        :title="'Select the due date and time for peer review(s)'"
        @next-card="nextCard"
        @prev-card="prevCard"
        @date-pick="setReviewDueDate"
        @time-pick="setReviewDueTime"
    >
        <b-form-checkbox class="checkboxes" @input="allowLateSubmissionReviews"
            >Allow late submission reviews indefinitely after the deadline</b-form-checkbox
        >
        <b-form-checkbox class="checkboxes" @input="blockFeedback"
            >Block feedback for students who did not finish their reviews</b-form-checkbox
        >
    </DatePickerCardTemplate>
</template>

<script>
import Cards from "@/mixins/cards"
import DatePickerCardTemplate from "@/components/teacher-dashboard/wizard/cards/DatePickerCardTemplate.vue"

export default {
    name: "DueDateReview",
    components: { DatePickerCardTemplate },
    mixins: [Cards],
    props: ["assignment"],
    methods: {
        setReviewDueDate(date) {
            this.assignment.reviewDueDay = date
        },
        setReviewDueTime(time) {
            this.assignment.reviewDueTime = time
        },
        allowLateSubmissionReviews() {
            this.assignment.lateSubmissionReviews = !this.assignment.lateSubmissionReviews
        },
        blockFeedback() {
            this.assignment.blockFeedback = !this.assignment.blockFeedback
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
