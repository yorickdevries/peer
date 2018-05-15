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

                    <b-card v-for="course in courses" :title="course.code" :sub-title="course.name" class="mb-3">
                        <p class="card-text">
                            {{ course.description}}
                        </p>
                        <b-button variant="success" :to="{ name: 'StudentDashboardCourse', params: { id: course.id } }">Enter</b-button>
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
                }],
                courses: [
                    {
                        id: "1",
                        code: "TI1316",
                        name: "Algoritmen en Datastructuren",
                        description: "Algorithms and data structures are fundamental notions in computer science and knowledge about standard data structures and algorithm is essential for programmers."
                    },
                    {
                        id: "2",
                        code: "TI2206",
                        name: "Concepts of Programming Languages",
                        description: "The design of a programming language is the result of a selection from a general collection of programming language concepts."
                    }
                ]
            }
        }
    }
</script>
