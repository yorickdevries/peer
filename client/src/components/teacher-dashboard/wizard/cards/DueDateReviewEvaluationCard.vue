<template>
    <DatePickerCardTemplate
        :title="'Select the due date and time for review evaluation(s)'"
        :isDisabled="isEvalDisabled"
        :selectedDate="assignment.reviewEvaluationDueDay"
        :selectedTime="assignment.reviewEvaluationDueTime"
        @next-card="nextCard"
        @prev-card="prevCard"
        @switch-mode="switchMode"
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
import moment from "moment/moment"
import notifications from "@/mixins/notifications"

export default {
    name: "DueDateReviewEvaluation",
    components: { DatePickerCardTemplate },
    mixins: [Cards, notifications],
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
        nextCard() {
            try {
                let publishDate = this.constructDate(this.assignment.publishDay, this.assignment.publishTime)
                let dueDate = this.constructDate(this.assignment.dueDay, this.assignment.dueTime)
                let reviewPublishDate = this.constructDate(
                    this.assignment.reviewPublishDay,
                    this.assignment.reviewPublishTime
                )
                let reviewDueDate = this.constructDate(this.assignment.reviewDueDay, this.assignment.reviewDueTime)
                let reviewEvaluationDueDate = null
                if (this.assignment.reviewEvaluation) {
                    reviewEvaluationDueDate = this.constructDate(
                        this.assignment.reviewEvaluationDueDay,
                        this.assignment.reviewEvaluationDueTime
                    )
                }
                if (
                    moment(publishDate).add(15, "minutes").isAfter(dueDate) ||
                    moment(dueDate).add(15, "minutes").isAfter(reviewPublishDate) ||
                    moment(reviewPublishDate).add(15, "minutes").isAfter(reviewDueDate) ||
                    (this.assignment.reviewEvaluation &&
                        moment(reviewDueDate).add(15, "minutes").isAfter(reviewEvaluationDueDate))
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

<style scoped>
.checkboxes {
    margin-top: 1rem;
    align-self: flex-start;
}
</style>
