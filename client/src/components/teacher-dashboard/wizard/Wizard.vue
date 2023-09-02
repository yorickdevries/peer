<template>
    <div>
        <component
            v-if="simpleMode"
            :assignment="assignment"
            @next-card="nextCard"
            @prev-card="prevCard"
            @switch-mode="switchMode"
            :is="cardNames[currCardIndex]"
        ></component>
        <!--        <AssignmentForm v-else :assignment="assignment" @submitted="onSubmit" :edit="false" />-->
        <AssignmentForm v-else :assignment="assignment" />
    </div>
</template>

<script>
import AssignmentDetailsCard from "@/components/teacher-dashboard/wizard/cards/AssignmentDetailsCard.vue"
import GroupUploadCard from "@/components/teacher-dashboard/wizard/cards/GroupUploadCard.vue"
import DocumentTypeCard from "@/components/teacher-dashboard/wizard/cards/DocumentTypeCard.vue"
import PublishAssignmentCard from "@/components/teacher-dashboard/wizard/cards/PublishAssignmentCard.vue"
import HandInAssignmentCard from "@/components/teacher-dashboard/wizard/cards/HandInAssignmentCard.vue"
import AssignmentFileCard from "@/components/teacher-dashboard/wizard/cards/AssignmentFileCard.vue"
import DueDateReviewEvaluationCard from "@/components/teacher-dashboard/wizard/cards/DueDateReviewEvaluationCard.vue"
import DueDateReviewCard from "@/components/teacher-dashboard/wizard/cards/DueDateReviewCard.vue"
import StartDateReviewCard from "@/components/teacher-dashboard/wizard/cards/StartDateReviewCard.vue"
import AssignmentLinkCard from "@/components/teacher-dashboard/wizard/cards/AssignmentLinkCard.vue"
import AssignmentForm from "@/components/teacher-dashboard/assignments/AssignmentForm.vue"
export default {
    name: "wizard",
    components: {
        AssignmentDetailsCard,
        GroupUploadCard,
        DocumentTypeCard,
        PublishAssignmentCard,
        HandInAssignmentCard,
        StartDateReviewCard,
        DueDateReviewCard,
        DueDateReviewEvaluationCard,
        AssignmentFileCard,
        AssignmentLinkCard,
        AssignmentForm,
    },
    props: ["assignment"],
    data() {
        return {
            cardNames: [
                "AssignmentDetailsCard",
                "GroupUploadCard",
                "DocumentTypeCard",
                "PublishAssignmentCard",
                "HandInAssignmentCard",
                "StartDateReviewCard",
                "DueDateReviewCard",
                "DueDateReviewEvaluationCard",
                "AssignmentFileCard",
                "AssignmentLinkCard",
            ],
            currCardIndex: 0,
            simpleMode: true,
        }
    },
    methods: {
        nextCard() {
            this.currCardIndex++
        },
        prevCard() {
            this.currCardIndex--
        },
        switchMode() {
            this.simpleMode = !this.simpleMode
        },
    },
}
</script>
