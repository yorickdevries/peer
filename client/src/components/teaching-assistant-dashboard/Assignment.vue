<template>
    <div>
        <b-container>

            <h1 class="mt-5">Assignment dashboard</h1>

            <!--Tab Layout-->
            <b-card no-body>
                <b-tabs card>

                    <!--Submissions-->
                    <b-tab title="Submissions" active>
                        <Submissions :assignmentId="$route.params.assignmentId"></Submissions>
                    </b-tab>

                    <!--Reviews-->
                    <b-tab title="Reviews">
                        <Reviews :assignmentId="$route.params.assignmentId"></Reviews>
                    </b-tab>

                </b-tabs>
            </b-card>


        </b-container>
    </div>
</template>

<script>
import api from "../../api"
import Submissions from "./assignment/Submissions"
import Reviews from './assignment/Reviews'

export default {
    components: {
        Submissions,
        Reviews
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
