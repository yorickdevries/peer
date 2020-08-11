<template>
    <div>
        <b-container>
            <!--Header-->
            <b-row>
                <b-col>
                    <div class="mt-5 mb-3">
                        <span class="h2">Courses</span>
                        <b-button
                            variant="success"
                            class="float-right"
                            v-if="showCreateCourseButton"
                            v-b-modal="`createCourseModal`"
                        >
                            Create Course
                        </b-button>
                        <b-modal id="createCourseModal" title="Create new course" centered hide-footer>
                            <CreateCourse></CreateCourse>
                        </b-modal>
                    </div>
                </b-col>
            </b-row>

            <b-card no-body>
                <b-tabs card>
                    <!--Enrolled Courses Tab-->
                    <b-tab title="Enrolled Courses">
                        <!--Filter Input-->
                        <b-row>
                            <b-col class="mb-3" cols="6">
                                <b-form-group label="" description="Search a course">
                                    <b-input placeholder="Filter courses" v-model="filterOptions.name"></b-input>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="Select the faculty">
                                    <b-form-select v-model="filterOptions.faculty">
                                        <b-form-select-option :value="null">All</b-form-select-option>
                                        <b-form-select-option
                                            v-for="faculty in faculties"
                                            :key="faculty.name"
                                            :value="faculty"
                                            >{{ faculty.name }} - {{ faculty.longName }}
                                        </b-form-select-option>
                                    </b-form-select>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="Select the academic year">
                                    <b-form-select v-model="filterOptions.academicYear">
                                        <b-form-select-option :value="null">All</b-form-select-option>
                                        <b-form-select-option
                                            v-for="academicYear in academicYears"
                                            :key="academicYear.name"
                                            :value="academicYear"
                                            >{{ academicYear.name }}</b-form-select-option
                                        >
                                    </b-form-select>
                                </b-form-group>
                            </b-col>
                        </b-row>

                        <!--No courses message-->
                        <b-row>
                            <b-col>
                                <h6 v-if="showNoEnrollmentsText">
                                    It seems that you have not been enrolled in any course. Enroll yourself in the next
                                    tab or contact your teacher.
                                </h6>
                            </b-col>
                        </b-row>

                        <!--Course Cards-->
                        <b-row>
                            <b-col
                                cols="6"
                                v-for="enrollment in filteredEnrollments"
                                :key="enrollment.course.id"
                                class="d-flex align-items-stretch mb-3"
                            >
                                <!--Single Card-->
                                <b-card no-body class="mb-3 w-100">
                                    <b-card-body class="d-flex flex-column">
                                        <div class="d-flex justify-content-between align-items-center mb-0">
                                            <h4 class="card-title m-0">{{ enrollment.course.name }}</h4>
                                            <b-badge show variant="primary font-weight-bold">{{
                                                enrollment.role.toUpperCase()
                                            }}</b-badge>
                                        </div>
                                        <p class="card-title mt-0 text-muted">
                                            {{ enrollment.course.courseCode }} - {{ enrollment.course.faculty.name }} -
                                            {{ enrollment.course.academicYear.name }}
                                        </p>

                                        <div class="mb-auto">
                                            <p v-if="enrollment.course.description != null">
                                                {{ enrollment.course.description | truncate(200) }}
                                            </p>
                                            <p v-else><i>No course description</i></p>
                                        </div>
                                        <div>
                                            <b-button
                                                v-if="enrollment.role === 'student'"
                                                variant="outline-primary"
                                                size="sm"
                                                :to="{
                                                    name: 'student-dashboard.course.home',
                                                    params: { courseId: enrollment.course.id }
                                                }"
                                            >
                                                Enter Course
                                            </b-button>
                                            <b-button
                                                v-else-if="enrollment.role === 'teachingassistant'"
                                                variant="outline-primary"
                                                size="sm"
                                                :to="{
                                                    name: 'teaching-assistant-dashboard.course.home',
                                                    params: { courseId: enrollment.course.id }
                                                }"
                                            >
                                                Enter Course
                                            </b-button>
                                            <b-button
                                                v-else-if="enrollment.role === 'teacher'"
                                                variant="outline-primary"
                                                size="sm"
                                                :to="{
                                                    name: 'teacher-dashboard.course',
                                                    params: { courseId: enrollment.course.id }
                                                }"
                                            >
                                                Enter Course
                                            </b-button>
                                        </div>
                                    </b-card-body>
                                </b-card>
                            </b-col>
                        </b-row>
                    </b-tab>

                    <!--Enrollable Courses Tab-->
                    <b-tab title="Enrollable Courses">
                        <!--Filter Input-->
                        <b-row>
                            <b-col class="mb-3" cols="6">
                                <b-form-group label="" description="Search a course">
                                    <b-input placeholder="Filter courses" v-model="filterOptions.name"></b-input>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="Select the faculty">
                                    <b-form-select v-model="filterOptions.faculty">
                                        <b-form-select-option :value="null">All</b-form-select-option>
                                        <b-form-select-option
                                            v-for="faculty in faculties"
                                            :key="faculty.name"
                                            :value="faculty"
                                            >{{ faculty.name }} - {{ faculty.longName }}
                                        </b-form-select-option>
                                    </b-form-select>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="Select the academic year">
                                    <b-form-select v-model="filterOptions.academicYear">
                                        <b-form-select-option :value="null">All</b-form-select-option>
                                        <b-form-select-option
                                            v-for="academicYear in academicYears"
                                            :key="academicYear.name"
                                            :value="academicYear"
                                            >{{ academicYear.name }}</b-form-select-option
                                        >
                                    </b-form-select>
                                </b-form-group>
                            </b-col>
                        </b-row>

                        <!--No courses message-->
                        <b-row>
                            <b-col>
                                <h6 v-if="showNoEnrollableCoursesText">
                                    You have been enrolled in all available courses at this moment.
                                </h6>
                            </b-col>
                        </b-row>

                        <!--Course Cards-->
                        <b-row>
                            <b-col
                                cols="6"
                                v-for="course in filteredEnrollableCourses"
                                :key="course.id"
                                class="d-flex align-items-stretch mb-3"
                            >
                                <!--Single Card-->
                                <b-card no-body class="mb-3 w-100">
                                    <b-card-body class="d-flex flex-column">
                                        <div class="d-flex justify-content-between align-items-center mb-0">
                                            <h4 class="card-title m-0">{{ course.name }}</h4>
                                        </div>
                                        <p class="card-title mt-0 text-muted">
                                            {{ course.courseCode }} - {{ course.faculty.name }} -
                                            {{ course.academicYear.name }}
                                        </p>

                                        <div class="mb-auto">
                                            <p v-if="course.description != null">
                                                {{ course.description | truncate(200) }}
                                            </p>
                                            <p v-else><i>No course description</i></p>
                                        </div>
                                        <div>
                                            <b-button
                                                variant="outline-primary"
                                                size="sm"
                                                @click="enrollInCourse(course.id)"
                                            >
                                                Enroll in Course
                                            </b-button>
                                        </div>
                                    </b-card-body>
                                </b-card>
                            </b-col>
                        </b-row>
                    </b-tab>
                </b-tabs>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api"
import notifications from "../../mixins/notifications"
import CreateCourse from "./CreateCourse"

export default {
    mixins: [notifications],
    components: {
        CreateCourse
    },
    data() {
        return {
            user: null,
            faculties: [],
            academicYears: [],
            enrollableCourses: [],
            enrollments: [],
            // used for filtering courses
            filterOptions: {
                name: "",
                faculty: null,
                academicYear: null
            }
        }
    },
    computed: {
        // determine whether the user is an employee
        showCreateCourseButton() {
            if (this.user === null) {
                return false
            }
            for (const affiliation of this.user.affiliation) {
                if (affiliation.name === "employee") {
                    return true
                }
            }
            return false
        },
        showNoEnrollmentsText() {
            return this.enrollments.length === 0
        },

        showNoEnrollableCoursesText() {
            return this.enrollableCourses.length === 0
        },
        filteredEnrollments() {
            return this.enrollments.filter(enrollment => {
                const course = enrollment.course
                return (
                    (course.name.toLowerCase().includes(this.filterOptions.name.toLowerCase()) || this.filter === "") &&
                    (this.filterOptions.faculty == null || course.faculty.name === this.filterOptions.faculty.name) &&
                    (this.filterOptions.academicYear == null ||
                        course.academicYear.name === this.filterOptions.academicYear.name)
                )
            })
        },
        filteredEnrollableCourses() {
            return this.enrollableCourses.filter(course => {
                return (
                    (course.name.toLowerCase().includes(this.filterOptions.name.toLowerCase()) || this.filter === "") &&
                    (this.filterOptions.faculty == null || course.faculty.name === this.filterOptions.faculty.name) &&
                    (this.filterOptions.academicYear == null ||
                        course.academicYear.name === this.filterOptions.academicYear.name)
                )
            })
        }
    },
    async created() {
        await this.fetchFaculties()
        await this.fetchAcademicYears()
        // Fetch courses that user has not yet enrolled in.
        await this.fetchEnrollableCourses()
        // Fetch enrolled courses.
        await this.fetchEnrollments()
        // Fetch user to see if create course button should be showed.
        await this.fetchUser()
    },
    methods: {
        async fetchUser() {
            let res = await api.getMe()
            this.user = res.data
            console.log(res)
        },
        async fetchFaculties() {
            let res = await api.faculties.get()
            this.faculties = res.data
        },
        async fetchAcademicYears() {
            const res = await api.academicYears.get()
            this.academicYears = res.data
            for (let academicYear of this.academicYears) {
                if (academicYear.active) {
                    this.filterOptions.selectedAcademicYear = academicYear
                }
            }
        },
        async fetchEnrollableCourses() {
            const res = await api.courses.getEnrollable()
            this.enrollableCourses = res.data
        },
        async fetchEnrollments() {
            const res = await api.enrollments.getEnrolledCourses()
            this.enrollments = res.data
        },
        async enrollInCourse(courseId) {
            await api.courses.enroll(courseId)
            this.showSuccessMessage({ message: "Successfully enrolled in course." })
            // reload the data from the server
            await this.fetchEnrollableCourses()
            await this.fetchEnrollableCourses()
            await this.fetchEnrollments()
        }
    }
}
</script>
