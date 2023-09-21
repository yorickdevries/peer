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
import moment from "moment"
import notifications from "@/mixins/notifications"

export default {
    name: "StartDateReview",
    components: { DatePickerCardTemplate },
    mixins: [Cards, notifications],
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
        nextCard() {
            try {
                let publishDate = this.constructDate(this.assignment.publishDay, this.assignment.publishTime)
                let dueDate = this.constructDate(this.assignment.dueDay, this.assignment.dueTime)
                let reviewPublishDate = this.constructDate(
                    this.assignment.reviewPublishDay,
                    this.assignment.reviewPublishTime
                )
                let reviewDueDate = this.constructDate(this.assignment.reviewDueDay, this.assignment.reviewDueTime)
                if (
                    moment(publishDate).add(15, "minutes").isAfter(dueDate) ||
                    moment(dueDate).add(15, "minutes").isAfter(reviewPublishDate) ||
                    moment(reviewPublishDate).add(15, "minutes").isAfter(reviewDueDate)
                ) {
                    throw new Error("The dates must chronologically correct and at least 15 minutes apart")
                } else {
                    this.$emit("next-card")
                }
            } catch (error) {
                this.showErrorMessage({ message: String(error) })
            }
        },
    },
}
</script>

<style scoped></style>
