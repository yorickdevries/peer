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
                                <b-form-select-option v-for="faculty in faculties" :key="faculty.id" :value="faculty"
                                    >{{ faculty.name }} - {{ faculty.longName }}
                                </b-form-select-option>
                            </b-form-select>
                        </b-form-group>

                        <b-form-group label="Academic Year" description="">
                            <b-form-select v-model="course.academicYear" required>
                                <b-form-select-option
                                    v-for="academicYear in academicYears"
                                    :key="academicYear.id"
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
                        <b-button type="submit" variant="primary">Create new Course</b-button>
                    </b-form>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    data() {
        return {
            course: {
                name: null,
                courseCode: null,
                enrollable: false,
                faculty: null,
                academicYear: null,
                description: null
            },
            faculties: [],
            academicYears: []
        }
    },
    async created() {
        await this.fetchFaculties()
        await this.fetchAcademicYears()
    },
    methods: {
        async fetchFaculties() {
            let res = await api.faculties.get()
            this.faculties = res.data
        },
        async fetchAcademicYears() {
            const res = await api.academicyears.get()
            this.academicYears = res.data
        },
        async onSubmit() {
            const res = await api.courses.post(
                this.course.name,
                this.course.courseCode,
                this.course.enrollable,
                this.course.faculty.id,
                this.course.academicYear.id,
                this.course.description
            )
            this.$router.push({ name: "teacher-dashboard.course", params: { courseId: res.data.id } })
        }
    }
}
</script>
