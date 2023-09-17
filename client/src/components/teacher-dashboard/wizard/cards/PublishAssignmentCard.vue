<template>
    <div>
        <DatePickerCardTemplate
            :title="'Select the publish/hand-in date and time'"
            :selectedDate="assignment.publishDay"
            :selectedTime="assignment.publishTime"
            :selectedDate1="assignment.dueDay"
            :selectedTime1="assignment.dueTime"
            :second="true"
            :firstTitle="`Publish Details`"
            :secondTitle="`Hand-in Details`"
            @next-card="nextCard"
            @prev-card="prevCard"
            @switch-mode="switchMode"
            @date-pick="setPublishDate"
            @time-pick="setPublishTime"
            @date-pick1="setHandInDate"
            @time-pick1="setHandInTime"
        >
            <b-form-checkbox class="checkboxes" v-model="assignment.lateSubmissions"
                >Allow late submissions until shortly before the reviews are distributed</b-form-checkbox
            >
        </DatePickerCardTemplate>
    </div>
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
        setHandInDate(date) {
            this.assignment.dueDay = date
        },
        setHandInTime(time) {
            this.assignment.dueTime = time
        },
    },
}
</script>

<style scoped></style>
