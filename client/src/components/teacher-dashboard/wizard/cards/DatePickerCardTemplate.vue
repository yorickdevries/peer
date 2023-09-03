<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard" @switch-mode="switchMode">
        <h1 class="text-center" style="font-size: 4rem">{{ title }}</h1>
        <div class="flexbox">
            <b-calendar :disabled="isDisabled" v-model="selectedDate" @context="onDatePick" locale="en-US"></b-calendar>
            <b-form-timepicker
                :disabled="isDisabled"
                class="timePicker"
                v-model="selectedTime"
                @input="onTimePick"
                locale="nl"
            ></b-form-timepicker>
        </div>
        <slot class="checkboxes"></slot>
    </CardTemplate>
</template>

<script>
import CardTemplate from "@/components/teacher-dashboard/wizard/CardTemplate.vue"
import Cards from "@/mixins/cards"

export default {
    name: "DatePickerCardTemplate",
    components: { CardTemplate },
    props: ["title", "isDisabled", "selectedDate", "selectedTime"],
    mixins: [Cards],
    methods: {
        onDatePick() {
            this.$emit("date-pick", new Date(this.selectedDate))
        },
        onTimePick() {
            this.$emit("time-pick", this.selectedTime)
        },
    },
}
</script>

<style scoped>
.flexbox {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}
.timePicker {
    width: 10rem;
}
.checkboxes {
    align-self: flex-start;
}
</style>
