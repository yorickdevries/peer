<template>
    <div>
        <b-container>
            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Edit Course</h1>
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
                                    placeholder="Please enter the course name"
                                    required
                                >
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Course code">
                                <b-form-input
                                    v-model="course.courseCode"
                                    type="text"
                                    placeholder="Please enter the course code"
                                    required
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
                                <b-form-select v-model="course.faculty" required>
                                    <b-form-select-option
                                        v-for="faculty in faculties"
                                        :key="faculty.name"
                                        :value="faculty"
                                        >{{ faculty.name }} - {{ faculty.longName }}
                                    </b-form-select-option>
                                </b-form-select>
                            </b-form-group>

                            <b-form-group label="Academic Year" description="">
                                <b-form-select v-model="course.academicYear" required>
                                    <b-form-select-option
                                        v-for="academicYear in academicYears"
                                        :key="academicYear.name"
                                        :value="academicYear"
                                        >{{ academicYear.name }}</b-form-select-option
                                    >
                                </b-form-select>
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
            course: {},
            faculties: [],
            academicYears: []
        }
    },
    async created() {
        // get courses
        let res = await api.courses.get(this.$route.params.courseId)
        this.course = res.data
        await this.fetchFaculties()
        await this.fetchActiveAcademicYears()
    },
    methods: {
        async fetchFaculties() {
            let res = await api.faculties.get()
            this.faculties = res.data
        },
        async fetchActiveAcademicYears() {
            const res = await api.academicYears.get(true)
            this.academicYears = res.data
        },
        async onSubmit() {
            await api.courses.patch(
                this.course.id,
                this.course.name,
                this.course.courseCode,
                this.course.enrollable,
                this.course.faculty.name,
                this.course.academicYear.name,
                this.course.description
            )
            this.$router.push({ name: "teacher-dashboard.course", params: { courseId: this.course.id } })
            location.reload()
        }
    }
}
</script>
