<template>
    <b-container>

        <b-row>
            <b-col>
                <h1 class="mt-5">{{ course.code }}: {{ course.name }}</h1>
                <b-breadcrumb :items="items"/>
            </b-col>
        </b-row>

        <b-row>
            <b-col>

                <b-tabs no-fade>
                    <b-row>
                        <b-col cols="8">

                            <!--Active Assignments-->
                            <b-tab title="Active Assignments" active>
                                <b-card v-for="assignment in activeAssignments" no-body class="mt-3">
                                    <b-card-body>
                                        <h4>{{ assignment.name}}</h4>
                                        <p>{{ assignment.description}}</p>
                                        <b-button variant="primary" :to="{ name: 'student-dashboard.assignment', params: { id: assignment.id } }">View Assignment</b-button>
                                    </b-card-body>
                                    <b-card-footer class="text-danger">Peer review due in 2 days</b-card-footer>
                                </b-card>
                            </b-tab>

                            <!--Closed Assignments-->
                            <b-tab title="Closed Assignments" >
                                <b-card v-for="assignment in activeAssignments" no-body class="mt-3">
                                    <b-card-body>
                                        <h4>{{ assignment.name}}</h4>
                                        <p>{{ assignment.description}}</p>
                                        <b-button variant="primary" :to="{ name: 'student-dashboard.assignment', params: { id: assignment.id } }">View Assignment</b-button>
                                    </b-card-body>
                                    <b-card-footer>Done</b-card-footer>
                                </b-card>
                            </b-tab>

                        </b-col>

                        <b-col cols="4" class="mt-3">

                                <!--Course Information-->
                                <b-card no-body>
                                    <b-card-body>
                                        <h4 class="card-title">Course Information</h4>
                                        <span class="font-weight-bold">Description</span>
                                        <p> {{course.description}}</p>

                                    </b-card-body>
                                </b-card>

                                <!--Group Information-->
                                <b-card no-body class="mt-3">
                                    <b-card-body>
                                        <h4 class="mb-0">Group Members</h4>
                                    </b-card-body>
                                    <b-list-group flush>
                                        <b-list-group-item v-for="member in members">{{ member }}</b-list-group-item>
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
                to: { name: 'student-dashboard.index'}
            }, {
                text: 'Courses',
                to: { name: 'student-dashboard'}
            }, {
                text: 'TI1316: Algoritmen en Datastructuren',
                active: true
            }],
            activeAssignments: [
                {
                    id: "1",
                    name: "Assignment 1",
                    description: "Some quick example text to build on the card title and make up the bulk of the card's content."
                },
                {
                    id: "2",
                    name: "Assignment 2",
                    description: "Some quick example text to build on the card title and make up the bulk of the card's content."
                }
            ],
            closedAssignments: [
                {
                    id: "3",
                    name: "Assignment 3",
                    description: "Some quick example text to build on the card title and make up the bulk of the card's content."
                },
                {
                    id: "4",
                    name: "Assignment 4",
                    description: "Some quick example text to build on the card title and make up the bulk of the card's content."
                }
            ],
            course: {
                id: "1",
                code: "TI1316",
                name: "Algoritmen en Datastructuren",
                description: "Algorithms and data structures are fundamental notions in computer science and knowledge about standard data structures and algorithm is essential for programmers."
            },
            members: ["User 1", "User 2", "User 3", "User 4", "User 5"]
        }
    }
}
</script>

<style scoped>

</style>