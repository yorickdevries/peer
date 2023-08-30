<template>
    <DatePickerCardTemplate :title="'Select the hand-in due date and time'" @next-card="nextCard" @prev-card="prevCard">
        <b-form-checkbox class="checkboxes"
            >Allow late submissions until shortly after before the reviews are distributed</b-form-checkbox
        >
    </DatePickerCardTemplate>
</template>

<script>
import DatePickerCardTemplate from "@/components/teacher-dashboard/wizard/cards/DatePickerCardTemplate.vue"
import Cards from "@/mixins/cards"

export default {
    name: "HandInAssignmentCard",
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
