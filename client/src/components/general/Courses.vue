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
                    <b-tab title="Your Courses">
                        <!--Filter Input  sm class="mb-3" cols="6" -->
                        <b-row>
                            <b-col sm="6">
                                <b-form-group label="" description="Search a course">
                                    <b-input placeholder="Filter courses" v-model="filterOptions.name"></b-input>
                                </b-form-group>
                            </b-col>
                            <b-col sm="3">
                                <b-form-group label="" description="Select the faculty">
                                    <b-form-select v-model="filterOptions.faculty">
                                        <b-form-select-option :value="null">All</b-form-select-option>
                                        <b-form-select-option
                                            v-for="faculty in faculties"
                                            :key="faculty.id"
                                            :value="faculty"
                                            >{{ faculty.name }} - {{ faculty.longName }}
                                        </b-form-select-option>
                                    </b-form-select>
                                </b-form-group>
                            </b-col>
                            <b-col sm="3">
                                <b-form-group label="" description="Select the academic year">
                                    <b-form-select v-model="filterOptions.academicYear">
                                        <b-form-select-option :value="null">All</b-form-select-option>
                                        <b-form-select-option value="active">Active</b-form-select-option>
                                        <b-form-select-option
                                            v-for="academicYear in academicYears"
                                            :key="academicYear.id"
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
                                sm="6"
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
                                                    params: { courseId: enrollment.course.id },
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
                                                    params: { courseId: enrollment.course.id },
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
                                                    params: { courseId: enrollment.course.id },
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
                    <b-tab title="All Courses">
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
                                            :key="faculty.id"
                                            :value="faculty"
                                            >{{ faculty.name }} - {{ faculty.longName }}
                                        </b-form-select-option>
                                    </b-form-select>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="Select the academic year">
                                    <b-form-select v-model="filterOptions.academicYear">
                                        <b-form-select-option value="active">Active</b-form-select-option>
                                        <b-form-select-option
                                            v-for="academicYear in academicYears"
                                            :key="academicYear.id"
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
                                            <b-button variant="outline-primary" v-b-modal="`enroll-${course.id}`"
                                                >Enroll in Course</b-button
                                            >
                                            <b-modal
                                                :id="`enroll-${course.id}`"
                                                :title="`Enroll in ${course.name}?`"
                                                centered
                                                hide-footer
                                            >
                                                Are you sure you want to enroll in the course "{{ course.name }}" as
                                                <b>student</b>? This action cannot be undone.
                                                <b-alert show
                                                    >If you are Co-teacher or TA in this course, please ask the teacher
                                                    to enroll you instead.</b-alert
                                                >
                                                <b-button
                                                    variant="primary"
                                                    size="sm"
                                                    @click="enrollInCourse(course.id)"
                                                >
                                                    Enroll in Course
                                                </b-button>
                                            </b-modal>
                                            <template v-if="user && user.admin">
                                                <b-button
                                                    class="ml-1"
                                                    variant="outline-warning"
                                                    v-b-modal="`enrollAdmin-${course.id}`"
                                                    >Admin Enrol</b-button
                                                >
                                                <b-modal
                                                    :id="`enrollAdmin-${course.id}`"
                                                    :title="`Enroll in ${course.name} as a admin?`"
                                                    centered
                                                    hide-footer
                                                >
                                                    Are you sure you want to enroll in the course "{{ course.name }}" as
                                                    <b>teacher</b>? You can later delete yourself.
                                                    <b-alert show
                                                        >Enrolling as an admin will give you the same rights as a
                                                        teacher of this course. Remember to delete yourself afterwards
                                                        if you don't want to be visible on the course staff
                                                        page.</b-alert
                                                    >
                                                    <b-button
                                                        variant="warning"
                                                        size="sm"
                                                        @click="enrollInCourseAsAdmin(course.id)"
                                                    >
                                                        Enroll in course as admin
                                                    </b-button>
                                                </b-modal>
                                            </template>
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
        CreateCourse,
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
                academicYear: "active",
            },
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
            return this.enrollments.filter((enrollment) => {
                const course = enrollment.course
                return (
                    (course.name.toLowerCase().includes(this.filterOptions.name.toLowerCase()) || this.filter === "") &&
                    (this.filterOptions.faculty == null || course.faculty.id === this.filterOptions.faculty.id) &&
                    (this.filterOptions.academicYear == null ||
                        (this.filterOptions.academicYear === "active" && course.academicYear.active) ||
                        course.academicYear.id === this.filterOptions.academicYear.id)
                )
            })
        },
        filteredEnrollableCourses() {
            return this.enrollableCourses.filter((course) => {
                return (
                    (course.name.toLowerCase().includes(this.filterOptions.name.toLowerCase()) || this.filter === "") &&
                    (this.filterOptions.faculty == null || course.faculty.id === this.filterOptions.faculty.id) &&
                    (this.filterOptions.academicYear == null ||
                        (this.filterOptions.academicYear === "active" && course.academicYear.active) ||
                        course.academicYear.id === this.filterOptions.academicYear.id)
                )
            })
        },
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
        },
        async fetchFaculties() {
            let res = await api.faculties.get()
            this.faculties = res.data
        },
        async fetchAcademicYears() {
            const res = await api.academicyears.get()
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
            await this.fetchEnrollments()
        },
        async enrollInCourseAsAdmin(courseId) {
            await api.courses.enrollAsAdmin(courseId)
            this.showSuccessMessage({ message: "Successfully enrolled in course as admin." })
            // reload the data from the server
            await this.fetchEnrollableCourses()
            await this.fetchEnrollments()
        },
    },
}
</script>
