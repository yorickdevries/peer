<template>
    <div>
        <b-container>

            <b-row>
                <b-col>
                    <h1 class="mt-5">Managed Courses</h1>
                    <b-breadcrumb :items="items"/>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-card title="Create Course">
                        <b-form @submit.prevent="onSubmit">
                            <b-form-group label="Name">
                                <b-form-input   v-model="course.name"
                                                type="text"
                                                placeholder="Please enter the course name here"
                                                required>

                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Description">
                                <b-form-input   v-model="course.description"
                                                type="text"
                                                placeholder="Please enter the course description"
                                                required>

                                </b-form-input>
                            </b-form-group>
                            <b-button type="submit" variant="primary">Create new Course</b-button>
                        </b-form>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api";

export default {
    async created() {
    },
    data() {
        return {
            items: [{
                text: 'Dashboard',
                to: { name: 'student-dashboard.index'}
            }, {
                text: 'Courses',
                to: { name: 'student-dashboard'}
            }],
            course: {
                name: null,
                description: null
            }
        }
    },
    methods: {
        async onSubmit() {
            let res = await api.createCourse(this.course)
            console.log(this.course)
            console.log(res)
            this.$router.push({name: 'courses'})
        }
    }
}
</script>