<template>
    <div>
        <b-container>
            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Edit {{ course.name }}</h1>
                </b-col>
            </b-row>

            <!--Create course card-->
            <b-row>
                <b-col>
                    <b-card>
                        <b-form @submit.prevent="onSubmit">
                            <b-form-group label="Course name">
                                <b-form-input
                                    v-model="course.name"
                                    type="text"
                                    placeholder="Please enter the course name here"
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
                                <b-form-textarea
                                    v-model="course.description"
                                    id="textareadescription"
                                    placeholder="Please enter the course description here"
                                    :rows="4"
                                    required
                                >
                                </b-form-textarea>
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
                            <b-button type="submit" variant="primary">Save changes</b-button>
                        </b-form>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api_old"

export default {
    data() {
        return {
            course: {
                id: null,
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
        let id = this.$route.params.courseId
        this.course.id = id
        let res = await api.getCourse(id)
        this.course = res.data

        await this.fetchFaculties()
        await this.fetchAcademicYears()
    },
    methods: {
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
            let res = await api.saveCourse(this.course.id, this.course)
            console.log(this.course)
            console.log(res)
            this.$router.push({ name: "teacher-dashboard.course", params: { courseId: this.course.id } })
        }
    }
}
</script>
