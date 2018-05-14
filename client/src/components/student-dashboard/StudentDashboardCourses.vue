<template>
    <div>
        <b-container>

            <b-row>
                <b-col>
                    <h1 class="mt-5">Your Courses</h1>
                    <b-breadcrumb :items="items"/>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-card title="TI1316"
                            sub-title="Algoritmen en Datastructuren"
                            class="mb-3">
                        <p class="card-text">
                            Algorithms and data structures are fundamental notions in computer science and knowledge about standard data structures and algorithm is essential for programmers.
                        </p>
                        <b-button variant="success" to="/dashboard/courses/1">Enter</b-button>
                    </b-card>

                    <b-card title="TI2206"
                            sub-title="Concepts of Programming Languages"
                            class="mb-3">
                        <p class="card-text">
                            The design of a programming language is the result of a selection from a general collection of programming language concepts.
                            With some frequency, new languages are introduced that combine concepts in an novel manner and sometimes...
                        </p>
                        <b-button variant="success" to="/dashboard/courses/2">Enter</b-button>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
export default {
    name: "StudentDashboardCourses",
    data() {
        return {
            items: [{
                text: 'Dashboard',
                to: { name: 'StudentDashboardMain'}
            }, {
                text: 'Courses',
                to: { name: 'StudentDashboardCourses'}
            }]
        }
    }
}
</script>
