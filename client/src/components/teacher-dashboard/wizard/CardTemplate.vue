<template>
    <b-card class="m-5 card">
        <slot></slot>
        <div class="nav-buttons">
            <b-button class="prev-button" variant="primary" @click="prevCard">Previous</b-button>
            <b-button class="next-button" variant="primary" @click="nextCard">Next</b-button>
        </div>
    </b-card>
</template>

<script>
import cards from "../../../mixins/cards"
export default {
    name: "CardTemplate",
    mixins: [cards],
}
</script>

<style scoped>
.nav-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 1rem;
}
</style>
