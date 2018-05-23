<template>
    <b-container>
        <b-row>
            <b-col>
                <b-breadcrumb :items="items" class="mt-3"/>
            </b-col>
        </b-row>
        <b-row>

            <b-col cols="12">

                <b-card no-body>

                    <b-row class="px-3 pt-0">
                        <router-link
                                active-class="bg-light"
                                class="col px-0"
                                tag="div"
                                :to="{ name: 'student-dashboard.assignment.hand-in' }">
                            <div class="text-center border-right border-bottom active py-3">
                                <div class="lead font-weight-bold">Hand-In - <span class="text-success">Open</span></div>
                                <div class="text-muted">Due: 20 Nov 23:57</div>
                            </div>
                        </router-link>

                        <router-link
                                active-class="bg-light"
                                class="col px-0 text-muted"
                                tag="div"
                                :to="{ name: 'student-dashboard.assignment.peer-review' }">

                            <div class="text-center border-right border-bottom py-3">
                                <div class="lead font-weight-bold">Peer Review - <span class="text-danger">Closed</span></div>
                                <span class="text-muted">Due: 20 Nov 23:58</span>
                            </div>
                        </router-link>

                        <router-link
                                active-class="bg-light"
                                class="col px-0 text-muted"
                                tag="div"
                                :to="{ name: 'student-dashboard.assignment.feedback' }">
                            <div class="text-center border-bottom py-3">
                                <div class="lead font-weight-bold ">Received Feedback - <span class="text-danger">Closed</span></div>
                                <span class="text-muted">Due: 20 Nov 23:59</span>
                            </div>
                        </router-link>

                    </b-row>

                    <b-card-body>
                        <b-row>
                            <b-col>
                                <router-view></router-view>
                            </b-col>
                        </b-row>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>

    </b-container>
</template>

<script>
import api from "../../api"

export default {
    async created() {

        // Get assignment.
        let res = await api.getAssignment(this.$route.params.id)
        this.assignment = res.data

        // Add assignment name to breadcrumb.
        this.items.push({
            text: this.assignment.title,
            active: true
        })
    },
    data() {
        return {
            items: [{
                text: 'Assignments',
                active: true
            }],
            assignment: {
                title: null
            }
        }
    }
}
</script>


