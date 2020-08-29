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
                        <Groups :assignmentId="assignment.id"></Groups>
                    </b-tab>

                    <!--Submissions-->
                    <b-tab title="Submissions">
                        <Submissions :assignmentId="assignment.id"></Submissions>
                    </b-tab>

                    <!--Reviews-->
                    <b-tab title="Reviews">
                        <Reviews
                            :assignmentId="assignment.id"
                            :pathName="'teacing-assistant-dashboard.assignments.assignment.review'"
                        ></Reviews>
                    </b-tab>
                </b-tabs>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api"
import BreadcrumbTitle from "../BreadcrumbTitle"
import Submissions from "../ta_teacher_shared/Submissions"
import Reviews from "../ta_teacher_shared/Reviews"
import Groups from "./Groups"
import AssignmentDetails from "../ta_teacher_shared/AssignmentDetails"

export default {
    components: {
        BreadcrumbTitle,
        Submissions,
        Reviews,
        Groups,
        AssignmentDetails
    },
    data() {
        return {
            assignment: {}
        }
    },
    async created() {
        let res = await api.assignments.get(this.$route.params.assignmentId)
        this.assignment = res.data
    }
}
</script>
