<template>
    <b-container>
        <b-row>
            <b-col>
                <h1 class="mt-5">TI1316: Algoritmen en Datastructuren</h1>
                <b-breadcrumb :items="items"/>
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="8">

                <b-tabs>
                    <b-tab title="Active Assignments" active>
                        <div class="card mt-3" >

                            <div class="card-body">
                                <div class="card-title">
                                    <h4>Assignment 1</h4>
                                    <span class="text-muted float-right">Peer Review Due</span>
                                </div>
                                <p class="card-text">
                                    Some quick example text to build on the card title and make up the bulk of the card's content.
                                </p>
                                <b-button variant="primary">View Assignment</b-button>
                            </div>

                            <div class="card-footer text-danger">
                                Peer review due in 2 days
                            </div>
                        </div>

                        <div class="card mt-3" >

                            <div class="card-body">
                                <div class="card-title">
                                    <h4>Assignment 2</h4>
                                    <span class="text-muted float-right">Peer Review Due</span>
                                </div>
                                <h5>Description</h5>
                                <p class="card-text">
                                    Some quick example text to build on the card title and make up the bulk of the card's content.
                                </p>
                                <b-button variant="primary">View Assignment</b-button>
                            </div>

                            <div class="card-footer text-danger">
                                Peer review due in 2 days
                            </div>
                        </div>

                    </b-tab>
                    <b-tab title="Closed Assignments" >
                        <b-card title="Assignment 3" class="mt-3">
                            <h5>Description</h5>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                Commodi consequuntur dolor illum impedit minus neque non quasi quis repudiandae. At atque culpa dicta eaque et molestias nulla quibusdam reiciendis sunt.
                            </p>
                            <b-button variant="primary">View Assignment</b-button>
                        </b-card>
                        <b-card title="Assignment 4" class="mt-3">
                            <h5>Description</h5>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                Commodi consequuntur dolor illum impedit minus neque non quasi quis repudiandae. At atque culpa dicta eaque et molestias nulla quibusdam reiciendis sunt.
                            </p>
                            <b-button variant="primary">View Assignment</b-button>
                        </b-card>
                    </b-tab>
                </b-tabs>
            </b-col>

            <b-col cols="4">
                <b-card title="Course Information">
                </b-card>
                <b-card title="Group Members" class="mt-3">
                </b-card>
            </b-col>
        </b-row>

    </b-container>
</template>

<script>
export default {
    name: "StudentDashboardCourse",
    data() {
        return {
            items: [{
                text: 'Dashboard',
                to: { name: 'StudentDashboardMain'}
            }, {
                text: 'Courses',
                to: { name: 'StudentDashboardCourses'}
            }, {
                text: 'TI1316: Algoritmen en Datastructuren',
                active: true
            }]
        }
    }
}
</script>

<style scoped>

</style>