<template>
    <CardTemplate :assignment="assignment" @next-card="nextCard" @prev-card="prevCard">
        <h1 class="text-center" style="font-size: 5rem">Add a file for the assignment (optional)</h1>
        <b-form-file class="form" placeholder="Choose a file" @input="setFile"> </b-form-file>
    </CardTemplate>
</template>

<script>
import Cards from "@/mixins/cards"
import CardTemplate from "@/components/teacher-dashboard/wizard/CardTemplate.vue"

export default {
    name: "AssignmentFileCard",
    components: { CardTemplate },
    mixins: [Cards],
    props: ["assignment"],

    methods: {
        setFile(file) {
            this.assignment.file = file
        },
    },
}
</script>

<style scoped>
.form {
    margin-top: 8rem;
    height: 5rem;
    font-size: 2rem;
}
</style>
