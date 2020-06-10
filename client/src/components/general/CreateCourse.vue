<template>
    <div>
        <b-container>
            <!--Create course card-->
            <b-row>
                <b-col>
                    <b-form @submit.prevent="onSubmit">
                        <b-form-group label="Course name">
                            <b-form-input
                                v-model="course.name"
                                type="text"
                                placeholder="Please enter the course name"
                                required
                            >
                            </b-form-input>
                        </b-form-group>
                        <b-form-group label="Course code">
                            <b-form-input
                                v-model="course.course_code"
                                type="text"
                                placeholder="Please enter the course code"
                            >
                            </b-form-input>
                        </b-form-group>
                        <b-form-group label="Course description">
                            <b-form-input
                                v-model="course.description"
                                type="text"
                                placeholder="Please enter a course description"
                            >
                            </b-form-input>
                        </b-form-group>

                        <b-form-group label="Faculty" description="">
                            <b-form-select :options="faculties" v-model="course.faculty"></b-form-select>
                        </b-form-group>

                        <b-form-group label="Academic Year" description="">
                            <b-form-select :options="academic_years" v-model="course.academic_year"></b-form-select>
                        </b-form-group>

                        <b-form-group label="">
                            <b-form-checkbox id="enrollable" v-model="course.enrollable">
                                Students can enroll themselves for this course
                            </b-form-checkbox>
                        </b-form-group>
                        <b-button type="submit" variant="primary">Create new Course</b-button>
                    </b-form>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../api"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    data() {
        return {
            course: {
                name: null,
                description: null,
                enrollable: false,
                faculty: null,
                academic_year: null,
                course_code: null
            },
            faculties: [],
            academic_years: []
        }
    },
    async created() {
        await this.fetchFaculties()
        await this.fetchAcademicYears()
        await this.fetchactiveAcademicYears()
    },
    methods: {
        async fetchactiveAcademicYears() {
            try {
                let res = await api.getactiveAcademicYears()
                this.course.academic_year = res.data[0].year
            } catch (e) {
                console.log(e)
            }
        },

        async fetchFaculties() {
            try {
                let res = await api.getFaculties()

                this.faculties = res.data.map(entry => {
                    return { value: entry.name, text: entry.name }
                })
            } catch (e) {
                console.log(e)
            }
        },

        async fetchAcademicYears() {
            try {
                let res = await api.getAcademicYears()
                this.academic_years = res.data.map(entry => {
                    return { value: entry.year, text: entry.year }
                })
            } catch (e) {
                console.log(e)
            }
        },

        async onSubmit() {
            try {
                await api.createCourse(this.course)
                this.$router.push({ name: "courses" })
                location.reload()
            } catch (e) {
                this.showErrorMessage()
            }
        }
    }
}
</script>
