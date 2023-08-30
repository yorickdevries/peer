<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard">
        <h1 class="text-center" style="font-size: 5rem">
            Add a link where the assignment can be found for the student (optional)
        </h1>
        <b-form-input class="link" type="text" placeholder="Link"></b-form-input>
    </CardTemplate>
</template>

<script>
import Cards from "@/mixins/cards"
import CardTemplate from "@/components/teacher-dashboard/wizard/CardTemplate.vue"

export default {
    name: "AssignmentLinkCard",
    components: { CardTemplate },
    mixins: [Cards],
}
</script>

<style scoped>
.link {
    height: 5rem;
    font-size: 2rem;
    margin-top: 5rem;
    margin-bottom: 1rem;
}
</style>
