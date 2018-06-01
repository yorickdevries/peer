<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Create a new course</h1>
                </b-col>
            </b-row>

            <!--Create course card-->
            <b-row>
                <b-col>
                    <b-card>
                        <b-form @submit.prevent="onSubmit">
                            <b-form-group label="Name">
                                <b-form-input   v-model="course.name"
                                                type="text"
                                                placeholder="Please enter the course name here"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Description">
                                <b-form-textarea    v-model="course.description"
                                                    id="textareadescription"
                                                    placeholder="Please enter the course description here"
                                                    :rows="4"
                                                    required>
                                </b-form-textarea>
                            </b-form-group>
                            <b-button type="submit" variant="primary">Save changes</b-button>
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
    data() {
        return {
            course: {
                id: null,
                name: null,
                description: null
            }
        }
    },
    async created() {
        let id = this.$route.params.id
        this.course.id = id
        let res = await api.getCourse(id)
        this.course = res.data
    },
    methods: {
        async onSubmit() {
            let res = await api.saveCourse(this.course.id, this.course)
            console.log(this.course)
            console.log(res)
            this.$router.push({name: 'teacher-dashboard.course', params: {id: this.course.id} })
        }
    }
}
</script>