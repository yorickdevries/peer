<template>
    <DatePickerCardTemplate
        :title="'Select the start date and time for peer review(s)'"
        @next-card="nextCard"
        @prev-card="prevCard"
        @date-pick="setReviewPublishDate"
        @time-pick="setReviewPublishTime"
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
    },
}
</script>

<style scoped></style>
