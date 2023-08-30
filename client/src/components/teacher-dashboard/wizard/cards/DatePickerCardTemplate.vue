<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard">
        <h1 class="text-center" style="font-size: 4rem">{{ title }}</h1>
        <div class="flexbox">
            <b-calendar v-model="value" @context="onContext" locale="en-US"></b-calendar>
            <b-form-timepicker class="timePicker" v-model="value" locale="en"></b-form-timepicker>
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
    props: ["title"],
    mixins: [Cards],
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
