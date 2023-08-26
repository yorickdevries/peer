<template>
    <DatePickerCardTemplate
        :title="'Select the start date and time for peer review(s)'"
        @next-card="nextCard"
        @prev-card="prevCard"
    >
        <b-form-checkbox>hello</b-form-checkbox>
    </DatePickerCardTemplate>
</template>

<script>
import DatePickerCardTemplate from "@/components/teacher-dashboard/wizard/cards/DatePickerCardTemplate.vue"

export default {
    name: "PublishAssignmentCard",
    components: { DatePickerCardTemplate },
}
</script>

<style scoped></style>
