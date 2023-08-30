<template>
    <DatePickerCardTemplate
        :title="'Select the start date and time for peer review(s)'"
        @next-card="nextCard"
        @prev-card="prevCard"
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
}
</script>

<style scoped></style>
