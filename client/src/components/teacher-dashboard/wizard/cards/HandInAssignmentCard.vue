<template>
    <DatePickerCardTemplate
        :title="'Select the hand-in due date and time'"
        :assignment="assignment"
        @next-card="nextCard"
        @prev-card="prevCard"
        @date-pick="setHandInDate"
        @time-pick="setHandInTime"
    >
        <b-form-checkbox class="checkboxes" @input="allowLateSubmissions"
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
    props: ["assignment"],
    methods: {
        setHandInDate(date) {
            this.assignment.dueDay = date
        },
        setHandInTime(time) {
            this.assignment.dueTime = time
        },
        allowLateSubmissions() {
            this.assignment.lateSubmissions = !this.assignment.lateSubmissions
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
