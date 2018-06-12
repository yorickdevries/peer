<template>
    <div>
        <b-container>

            <h1 class="mt-5">Assignment dashboard: {{ assignment.title }}</h1>

            <!--Tab Layout-->
            <b-card no-body>
                <b-tabs card>

                    <!--Details-->
                    <b-tab title="Home" active>
                        <AssignmentDetails :assignment="assignment"></AssignmentDetails>
                    </b-tab>

                    <!--Submissions-->
                    <b-tab title="Submissions">
                        <Submissions :assignmentId="$route.params.assignmentId"></Submissions>
                    </b-tab>

                    <!--Reviews-->
                    <b-tab title="Reviews">
                        <Reviews :assignmentId="$route.params.assignmentId"></Reviews>
                    </b-tab>

                    <!--Groups-->
                    <b-tab title="Groups">
                        <Groups :assignment-id="$route.params.assignmentId"></Groups>
                    </b-tab>
                </b-tabs>
            </b-card>


        </b-container>
    </div>
</template>

<script>
import api from "../../api"
import Submissions from "../ta_teacher_shared/Submissions"
import Reviews from '../ta_teacher_shared/Reviews'
import Groups from '../ta_teacher_shared/Groups'
import AssignmentDetails from '../ta_teacher_shared/AssignmentDetails'

export default {
    components: {
        Submissions,
        Reviews,
        Groups,
        AssignmentDetails
    },
    data() {
        return {
            items: [
                {
                    text: 'Course Home',
                    active: true
                }
            ],
            assignment: {
                id: null,
                title: "",
                due_date: ""
            }
        }
    },
    async created() {
        // Fetch course information.
        let {data} = await api.getAssignment(this.$route.params.assignmentId);
        this.assignment = data
    }
}
</script>
