<template>
    <b-card v-if="simpleMode" class="m-5 card">
        <slot></slot>
        <div class="nav-buttons">
            <b-button class="prev-button" variant="primary" @click="prevCard">Previous</b-button>
            <b-button
                class="prev-button"
                variant="primary"
                @click="
                    () => {
                        simpleMode = false
                    }
                "
                >Switch to advanced mode</b-button
            >
            <b-button class="next-button" variant="primary" @click="nextCard">Next</b-button>
        </div>
    </b-card>
    <AssignmentForm v-else @submitted="onSubmit" :assignment="assignment" :edit="false" />
</template>

<script>
import cards from "../../../mixins/cards"
import AssignmentForm from "@/components/teacher-dashboard/assignments/AssignmentForm.vue"
export default {
    name: "CardTemplate",
    components: { AssignmentForm },
    mixins: [cards],
    props: ["assignment"],
    data() {
        return {
            simpleMode: true,
        }
    },
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
