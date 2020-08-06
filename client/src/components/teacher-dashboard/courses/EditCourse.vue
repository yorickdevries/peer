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
                                    v-model="course.courseCode"
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
                                <b-form-select :options="faculties" v-model="course.faculty.name"></b-form-select>
                            </b-form-group>

                            <b-form-group label="Academic Year" description="">
                                <b-form-select
                                    :options="academicYears"
                                    v-model="course.academicYear.name"
                                ></b-form-select>
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
import api from "../../../api/api"

export default {
    data() {
        return {
            course: {
                id: null,
                name: null,
                description: null,
                enrollable: false,
                faculty: {
                    name: null,
                    longName: null
                },
                academicYear: {
                    name: null,
                    active: null
                },
                courseCode: null
            },
            faculties: [],
            academicYears: []
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
                let res = await api.getAcademicYears(true)
                this.academicYears = res.data.map(entry => {
                    return { value: entry.name, text: entry.name }
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
