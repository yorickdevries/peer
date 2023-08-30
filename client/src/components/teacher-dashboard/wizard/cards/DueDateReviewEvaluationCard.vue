<template>
    <DatePickerCardTemplate
        :title="'Select the due date and time for review evaluation(s)'"
        @next-card="nextCard"
        @prev-card="prevCard"
    >
        <b-form-checkbox class="checkboxes"
            >Allow late review evaluations indefinitely after the deadline
        </b-form-checkbox>
        <b-form-checkbox class="checkboxes">I don't want to enable review evaluations</b-form-checkbox>
    </DatePickerCardTemplate>
</template>

<script>
import DatePickerCardTemplate from "@/components/teacher-dashboard/wizard/cards/DatePickerCardTemplate.vue"
import Cards from "@/mixins/cards"

export default {
    name: "DueDateReviewEvaluation",
    components: { DatePickerCardTemplate },
    mixins: [Cards],
}
</script>

<style scoped>
.checkboxes {
    margin-top: 1rem;
    align-self: flex-start;
}
</style>
