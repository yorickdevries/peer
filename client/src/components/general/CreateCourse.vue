<template>
    <div>
        <b-container>

            <!--Create course card-->
            <b-row>
                <b-col>
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
                </b-col>
            </b-row>

        </b-container>
    </div>
</template>

<script>
import api from "../../api";
import notifications from '../../mixins/notifications'

export default {
    mixins: [notifications],
    data() {
        return {
            course: {
                name: null,
                description: null
            }
        }
    },
    methods: {
        async onSubmit() {
            try {
                await api.createCourse(this.course)
                this.$router.push({name: 'courses'})
                location.reload()
            } catch (e) {
                this.showErrorMessage()
            }
        }
    }
}
</script>