<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard">
        <h1 class="text-center" style="font-size: 5rem">Please upload a comma separated file containing the groups</h1>
        <b-form-file class="form" placeholder=".csv" accept=".csv"> </b-form-file>
    </CardTemplate>
</template>

<script>
import CardTemplate from "@/components/teacher-dashboard/wizard/CardTemplate.vue"
import Cards from "@/mixins/cards"
export default {
    name: "AssignmentDetailsCard",
    components: { CardTemplate },
    mixins: [Cards],
}
</script>

<style scoped>
.form {
    margin-top: 8rem;
    height: 5rem;
    font-size: 2rem;
}
</style>
