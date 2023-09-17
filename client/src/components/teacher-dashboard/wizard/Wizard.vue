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
        <AssignmentForm
            v-else
            :assignment="assignment"
            :simpleModeButton="showSimpleModeButton"
            @submitted="onSubmit"
            @switch-mode="switchMode"
        />
    </div>
</template>

<script>
import AssignmentDetailsCard from "@/components/teacher-dashboard/wizard/cards/AssignmentDetailsCard.vue"
import DocumentTypeCard from "@/components/teacher-dashboard/wizard/cards/DocumentTypeCard.vue"
import PublishAssignmentCard from "@/components/teacher-dashboard/wizard/cards/PublishAssignmentCard.vue"
import AssignmentFileCard from "@/components/teacher-dashboard/wizard/cards/AssignmentFileCard.vue"
import DueDateReviewEvaluationCard from "@/components/teacher-dashboard/wizard/cards/DueDateReviewEvaluationCard.vue"
import StartDateReviewCard from "@/components/teacher-dashboard/wizard/cards/StartDateReviewCard.vue"
import AssignmentForm from "@/components/teacher-dashboard/assignments/AssignmentForm.vue"
export default {
    name: "wizard",
    components: {
        AssignmentDetailsCard,
        DocumentTypeCard,
        PublishAssignmentCard,
        StartDateReviewCard,
        DueDateReviewEvaluationCard,
        AssignmentFileCard,
        AssignmentForm,
    },
    props: ["assignment"],
    data() {
        return {
            cardNames: [
                "AssignmentDetailsCard",
                "DocumentTypeCard",
                "PublishAssignmentCard",
                "StartDateReviewCard",
                "DueDateReviewEvaluationCard",
                "AssignmentFileCard",
            ],
            currCardIndex: 0,
            simpleMode: true,
            showSimpleModeButton: true,
        }
    },
    methods: {
        nextCard() {
            if (this.currCardIndex < this.cardNames.length - 1) {
                this.currCardIndex++
            } else {
                this.showSimpleModeButton = false
                this.switchMode()
            }
        },
        prevCard() {
            this.currCardIndex--
        },
        switchMode() {
            this.simpleMode = !this.simpleMode
        },
        onSubmit(data) {
            this.$emit("submitted", data)
        },
    },
}
</script>
