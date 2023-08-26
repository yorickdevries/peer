<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard">
        <h1 class="text-center custom-margin" style="font-size: 4rem">
            Choose the type of assignment to be submitted.
        </h1>
        <div class="buttons">
            <b-button class="custom-button">Document</b-button>
            <b-button class="custom-button">Code</b-button>
            <b-button class="custom-button">Text</b-button>
        </div>
    </CardTemplate>
</template>

<script>
import cards from "../../../../mixins/cards"
import CardTemplate from "@/components/teacher-dashboard/wizard/CardTemplate.vue"

export default {
    name: "DocumentTypeCard",
    components: { CardTemplate },
    mixins: [cards],
}
</script>

<style scoped>
.buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    margin-bottom: 5rem;
}
.custom-margin {
    margin-bottom: 15rem;
}
.custom-button {
    font-size: 1.5rem;
    padding: 20px 30px;
    width: 20rem;
}
</style>
