<template>
    <DatePickerCardTemplate
        :title="'Select the start date and time for peer review(s)'"
        :selectedDate="assignment.reviewPublishDay"
        :selectedTime="assignment.reviewPublishTime"
        :selectedDate1="assignment.reviewDueDay"
        :selectedTime1="assignment.reviewDueTime"
        :second="true"
        :firstTitle="`Review Start Details`"
        :secondTitle="`Review Hand-in Details`"
        @next-card="nextCard"
        @prev-card="prevCard"
        @switch-mode="switchMode"
        @date-pick="setReviewPublishDate"
        @time-pick="setReviewPublishTime"
        @date-pick1="setReviewDueDate"
        @time-pick1="setReviewDueTime"
    >
        <b-form-checkbox class="checkboxes" v-model="this.assignment.lateSubmissionReviews"
            >Allow late submission reviews indefinitely after the deadline</b-form-checkbox
        >
        <b-form-checkbox class="checkboxes" v-model="this.assignment.blockFeedback"
            >Block feedback for students who did not finish their reviews</b-form-checkbox
        >
    </DatePickerCardTemplate>
</template>

<script>
import DatePickerCardTemplate from "@/components/teacher-dashboard/wizard/cards/DatePickerCardTemplate.vue"
import Cards from "@/mixins/cards"

export default {
    name: "StartDateReview",
    components: { DatePickerCardTemplate },
    mixins: [Cards],
    props: ["assignment"],
    methods: {
        setReviewPublishDate(date) {
            this.assignment.reviewPublishDay = date
        },
        setReviewPublishTime(time) {
            this.assignment.reviewPublishTime = time
        },
        setReviewDueDate(date) {
            this.assignment.reviewDueDay = date
        },
        setReviewDueTime(time) {
            this.assignment.reviewDueTime = time
        },
    },
}
</script>

<style scoped></style>
