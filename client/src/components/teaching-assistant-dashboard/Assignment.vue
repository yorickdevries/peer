<template>
    <div>
        <b-container>
            <!--Header-->
            <BreadcrumbTitle :items="['Assignments', assignment.name]" class="mt-3"></BreadcrumbTitle>

            <!--Tab Layout-->
            <b-card no-body>
                <b-tabs card>
                    <!--Details-->
                    <b-tab title="Home" active>
                        <AssignmentDetails :assignment="assignment"></AssignmentDetails>
                    </b-tab>

                    <!--Groups-->
                    <b-tab title="Groups">
                        <Groups></Groups>
                    </b-tab>

                    <!--Submissions-->
                    <b-tab title="Submissions">
                        <SubmissionList></SubmissionList>
                    </b-tab>

                    <!--Reviews-->
                    <b-tab title="Reviews">
                        <ReviewList></ReviewList>
                    </b-tab>
                </b-tabs>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api"
import BreadcrumbTitle from "../BreadcrumbTitle"
import AssignmentDetails from "../ta_teacher_shared/AssignmentDetails"
import Groups from "./Groups"
import ReviewList from "../ta_teacher_shared/ReviewList"
import SubmissionList from "../ta_teacher_shared/SubmissionList"

export default {
    components: {
        BreadcrumbTitle,
        AssignmentDetails,
        Groups,
        ReviewList,
        SubmissionList
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
