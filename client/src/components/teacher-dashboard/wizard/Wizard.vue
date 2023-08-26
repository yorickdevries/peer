<template>
    <div>
        <component @next-card="nextCard" @prev-card="prevCard" :is="cardNames[currCardIndex]"></component>
    </div>
</template>

<script>
import AssignmentDetailsCard from "@/components/teacher-dashboard/wizard/cards/AssignmentDetailsCard.vue"
import GroupUploadCard from "@/components/teacher-dashboard/wizard/cards/GroupUploadCard.vue"
import DocumentTypeCard from "@/components/teacher-dashboard/wizard/cards/DocumentTypeCard.vue"
export default {
    name: "wizard",
    components: { AssignmentDetailsCard, GroupUploadCard, DocumentTypeCard },
    data() {
        return {
            cardNames: ["AssignmentDetailsCard", "GroupUploadCard", "DocumentTypeCard"],
            currCardIndex: 0,
        }
    },
    methods: {
        nextCard() {
            this.currCardIndex++
        },
        prevCard() {
            this.currCardIndex--
        },
    },
}
</script>
