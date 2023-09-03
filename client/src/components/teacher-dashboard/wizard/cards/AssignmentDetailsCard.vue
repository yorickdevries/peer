<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard" @switch-mode="switchMode">
        <h1 class="text-center" style="font-size: 5rem">Assignment Details</h1>
        <b-form-input
            v-model="assignment.name"
            class="assignment-name"
            type="text"
            placeholder="Assignment Name"
        ></b-form-input>
        <b-form-textarea
            v-model="assignment.description"
            class="description"
            type="text"
            placeholder="Description"
        ></b-form-textarea>
        <b-form-checkbox v-model="assignment.sendNotificationEmails">Send notification emails</b-form-checkbox>
    </CardTemplate>
</template>

<script>
import CardTemplate from "@/components/teacher-dashboard/wizard/CardTemplate.vue"
import Cards from "@/mixins/cards"
export default {
    name: "AssignmentDetailsCard",
    components: { CardTemplate },
    mixins: [Cards],
    props: ["assignment"],
}
</script>

<style scoped>
.description {
    height: 10rem;
    font-size: 1.5rem;
}
.assignment-name {
    height: 5rem;
    font-size: 2rem;
    margin-top: 5rem;
    margin-bottom: 1rem;
}
</style>
