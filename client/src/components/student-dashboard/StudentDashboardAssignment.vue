<template>
    <b-container>
        <b-row>
            <b-col>
                <h1 class="mt-5">Assignment 1</h1>
                <b-breadcrumb :items="items"/>
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="12">
                <b-card no-body>
                    <b-row class="p-3 border-bottom">
                            <b-col class="text-center border-right ">
                                <router-link :to=" { name: 'HandIn' }">
                                    <div class="lead font-weight-bold">Hand-In - <span class="text-success">Open</span></div>
                                    <div class="text-muted">Due: 20 Nov 23:57</div>
                                </router-link>
                            </b-col>
                        <b-col class="text-center border-right ">
                            <router-link :to=" { name: 'PeerReview' }">
                                <div class="lead font-weight-bold">Peer Review - <span class="text-danger">Closed</span></div>
                                <span class="text-muted">Due: 20 Nov 23:58</span>
                            </router-link>
                        </b-col>
                        <b-col class="text-center">
                            <router-link :to=" { name: 'Feedback' }">
                                <div class="lead font-weight-bold ">Received Feedback - <span class="text-danger">Closed</span></div>
                                <span class="text-muted">Due: 20 Nov 23:59</span>
                            </router-link>
                        </b-col>
                    </b-row>

                    <b-card-body class="">

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
    export default {
        name: "StudentDashboardAssignment",
        data() {
            return {
                items: [{
                    text: 'Dashboard',
                    to: {name: 'StudentDashboardMain'}
                }, {
                    text: 'Courses',
                    to: {name: 'StudentDashboardCourses'}
                }, {
                    text: 'TI1316: Algoritmen en Datastructuren',
                    href: '#/dashboard/courses'
                },
                {
                    text: 'Assignment 1',
                    active: true
                }]
            }
        }
    }
</script>

<style scoped>

</style>