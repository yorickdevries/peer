<template>
    <div>
        <b-container v-if="!assignment">
            <div>Loading Assignment</div>
        </b-container>

        <b-container v-else>
            <!--Header and action-->
            <BreadcrumbTitle :items="['Assignments', assignment.name]" class="mt-3">
                <b-button
                    variant="success"
                    :to="{
                        name: 'teacher-dashboard.assignments.assignment.edit',
                        params: { courseId: this.$route.params.courseId, assignmentId: assignment.id }
                    }"
                >
                    Edit assignment
                </b-button>
            </BreadcrumbTitle>

            <b-card no-body>
                <b-tabs card lazy>
                    <!--Details & Action-->
                    <b-tab title="Home" active>
                        <AssignmentHome></AssignmentHome>
                    </b-tab>

                    <!--AssignmentVersions-->
                    <b-tab title="Assignment Versions">
                        <AssignmentVersions></AssignmentVersions>
                    </b-tab>

                    <!--Groups-->
                    <b-tab title="Groups">
                        <Groups></Groups>
                    </b-tab>

                    <!--SubmissionQuestionnaireList-->
                    <b-tab title="Submissionquestionnaire">
                        <SubmissionQuestionnaireList></SubmissionQuestionnaireList>
                    </b-tab>

                    <!--ReviewQuestionnaireList-->
                    <b-tab v-if="assignment.reviewEvaluation" title="Reviewquestionnaire">
                        <ReviewQuestionnaireList></ReviewQuestionnaireList>
                    </b-tab>

                    <!--Submissions-->
                    <b-tab title="Submissions">
                        <SubmissionList></SubmissionList>
                    </b-tab>

                    <!--Reviews-->
                    <b-tab title="Reviews">
                        <ReviewList></ReviewList>
                    </b-tab>

                    <!--Assignment Exports-->
                    <b-tab title="Exports">
                        <AssignmentExports></AssignmentExports>
                    </b-tab>
                </b-tabs>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api/api"
import BreadcrumbTitle from "../../BreadcrumbTitle"
import AssignmentHome from "./AssignmentHome"
import AssignmentVersions from "../assignmentVersions/AssignmentVersions"
import SubmissionQuestionnaireList from "../questionnaire/SubmissionQuestionnaireList"
import ReviewQuestionnaireList from "../questionnaire/ReviewQuestionnaireList"
import Groups from "../Groups"
import ReviewList from "../../ta_teacher_shared/ReviewList"
import SubmissionList from "../../ta_teacher_shared/SubmissionList"
import AssignmentExports from "../AssignmentExports"

export default {
    components: {
        BreadcrumbTitle,
        AssignmentHome,
        AssignmentVersions,
        SubmissionQuestionnaireList,
        ReviewQuestionnaireList,
        Groups,
        ReviewList,
        SubmissionList,
        AssignmentExports
    },
    data() {
        return {
            assignment: null
        }
    },
    async created() {
        await this.fetchAssignment()
    },
    methods: {
        async fetchAssignment() {
            this.assignment = null
            let res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        }
    }
}
</script>
