<template>
    <b-container>
        <b-row>
            <b-col>
                <h1 class="mt-5">TI1316: Algoritmen en Datastructuren</h1>
                <b-breadcrumb :items="items"/>
            </b-col>
        </b-row>
        <b-row>
            <b-col>

                <b-tabs no-fade>
                    <b-row>
                        <b-col cols="8">

                            <b-tab title="Active Assignments" active>

                                <b-card no-body class="mt-3">
                                    <b-card-body>
                                        <h4>Assignment 1</h4>
                                        <p>
                                            Some quick example text to build on the card title and make up the bulk of the card's content.
                                        </p>
                                        <b-button variant="primary" to="/dashboard/assignment/1">View Assignment</b-button>
                                    </b-card-body>
                                    <b-card-footer class="text-danger">Peer review due in 2 days</b-card-footer>
                                </b-card>

                                <b-card no-body class="mt-3">
                                    <b-card-body>
                                        <h4>Assignment 2</h4>
                                        <p>
                                            Some quick example text to build on the card title and make up the bulk of the card's content.
                                        </p>
                                        <b-button variant="primary">View Assignment</b-button>

                                    </b-card-body>
                                    <b-card-footer class="text-danger">Peer review due in 2 days</b-card-footer>
                                </b-card>


                            </b-tab>

                            <b-tab title="Closed Assignments" >
                                <b-card no-body class="mt-3">
                                    <b-card-body>
                                        <h4>Assignment 3</h4>
                                        <h5>Description</h5>
                                        <p>
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                            Commodi consequuntur dolor illum impedit minus neque non quasi quis repudiandae. At atque culpa dicta eaque et molestias nulla quibusdam reiciendis sunt.
                                        </p>
                                        <b-button variant="primary">View Assignment</b-button>
                                    </b-card-body>
                                    <b-card-footer>Done</b-card-footer>
                                </b-card>
                                <b-card no-body class="mt-3">
                                    <b-card-body>
                                        <h4>Assignment 4</h4>
                                        <h5>Description</h5>
                                        <p>
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                            Commodi consequuntur dolor illum impedit minus neque non quasi quis repudiandae. At atque culpa dicta eaque et molestias nulla quibusdam reiciendis sunt.
                                        </p>
                                        <b-button variant="primary">View Assignment</b-button>
                                    </b-card-body>
                                    <b-card-footer>Done</b-card-footer>
                                </b-card>
                            </b-tab>

                        </b-col>
                        <b-col cols="4" class="mt-3">
                                <b-card no-body>
                                    <b-card-body>
                                        <h4 class="card-title">Course Information</h4>
                                        <span class="font-weight-bold">Description</span>
                                        <p>Algorithms and data structures are fundamental notions in computer science and knowledge about standard data structures and algorithm is essential for programmers.</p>

                                    </b-card-body>
                                </b-card>
                                <b-card no-body class="mt-3">
                                    <b-card-body>
                                        <h4 class="mb-0">Group Members</h4>
                                    </b-card-body>
                                    <b-list-group flush>
                                        <b-list-group-item>User 1</b-list-group-item>
                                        <b-list-group-item>User 2</b-list-group-item>
                                        <b-list-group-item>User 3</b-list-group-item>
                                        <b-list-group-item>User 4</b-list-group-item>
                                        <b-list-group-item>User 5</b-list-group-item>
                                    </b-list-group>

                                </b-card>
                        </b-col>
                    </b-row>
                </b-tabs>
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