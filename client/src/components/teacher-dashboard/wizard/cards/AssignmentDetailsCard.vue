<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard" @switch-mode="switchMode">
        <h1 class="text-center" style="font-size: 5rem">Assignment Details</h1>
        <b-form-input
            v-model="name"
            class="assignment-name"
            type="text"
            placeholder="Assignment Name"
            @input="setAssignmentName"
        ></b-form-input>
        <b-form-textarea
            v-model="description"
            class="description"
            type="text"
            placeholder="Description"
            @input="setAssignmentDescription"
        ></b-form-textarea>
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
    data() {
        return {
            name: "",
            description: "",
        }
    },
    methods: {
        setAssignmentName() {
            this.assignment.name = this.name
        },
        setAssignmentDescription() {
            this.assignment.description = this.description
        },
    },
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
