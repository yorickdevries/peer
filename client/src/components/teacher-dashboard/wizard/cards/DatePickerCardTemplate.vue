<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard" @switch-mode="switchMode">
        <h1 class="text-center" style="font-size: 4rem">{{ title }}</h1>
        <div class="flexbox">
            <div>
                <h3>{{ firstTitle }}</h3>
                <b-calendar
                    :disabled="isDisabled"
                    v-model="selectedDate"
                    @context="onDatePick"
                    locale="en-US"
                ></b-calendar>
                <b-form-timepicker
                    :disabled="isDisabled"
                    class="timePicker"
                    v-model="selectedTime"
                    @input="onTimePick"
                    locale="nl"
                ></b-form-timepicker>
            </div>

            <div v-if="second">
                <h3>{{ secondTitle }}</h3>
                <b-calendar
                    :disabled="isDisabled"
                    v-model="selectedDate1"
                    @context="onDatePick1"
                    locale="en-US"
                ></b-calendar>
                <b-form-timepicker
                    :disabled="isDisabled"
                    class="timePicker"
                    v-model="selectedTime1"
                    @input="onTimePick1"
                    locale="nl"
                ></b-form-timepicker>
            </div>
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
    props: [
        "title",
        "isDisabled",
        "selectedDate",
        "selectedTime",
        "selectedDate1",
        "selectedTime1",
        "second",
        "firstTitle",
        "secondTitle",
    ],
    mixins: [Cards],
    methods: {
        onDatePick() {
            this.$emit("date-pick", new Date(this.selectedDate))
        },
        onTimePick() {
            this.$emit("time-pick", this.selectedTime)
        },
        onDatePick1() {
            this.$emit("date-pick1", new Date(this.selectedDate1))
        },
        onTimePick1() {
            this.$emit("time-pick1", this.selectedTime1)
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
