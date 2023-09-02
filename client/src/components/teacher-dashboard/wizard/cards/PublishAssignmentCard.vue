<template>
    <DatePickerCardTemplate
        :title="'Select the publish date and time'"
        @next-card="nextCard"
        @prev-card="prevCard"
        @switch-mode="switchMode"
        @date-pick="setPublishDate"
        @time-pick="setPublishTime"
    >
    </DatePickerCardTemplate>
</template>

<script>
import DatePickerCardTemplate from "@/components/teacher-dashboard/wizard/cards/DatePickerCardTemplate.vue"
import Cards from "@/mixins/cards"

export default {
    name: "PublishAssignmentCard",
    components: { DatePickerCardTemplate },
    mixins: [Cards],
    props: ["assignment"],
    methods: {
        setPublishDate(date) {
            this.assignment.publishDay = date
        },
        setPublishTime(time) {
            this.assignment.publishTime = time
        },
    },
}
</script>

<style scoped></style>
