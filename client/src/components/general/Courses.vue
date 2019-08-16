<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <div class="mt-5 mb-3">
                        <span class="h2">Courses</span>
                        <b-button   variant="success"
                                    class="float-right"
                                    v-if="showCreateCourseButton"
                                    v-b-modal="`createCourseModal`">
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
                                    <b-input placeholder="Filter courses" v-model="filter"></b-input>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="Select the faculty">
                                    <b-form-select :options="faculties" v-model="filterOptions.faculty"></b-form-select>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="Select the academic year">
                                    <b-form-select :options="academic_years" v-model="filterOptions.academic_year"></b-form-select>
                                </b-form-group>
                            </b-col>
                        </b-row>

                        <!--No courses message-->
                        <b-row>
                            <b-col>
                                <h6 v-if="showNoCoursesText">It seems that you have not been enrolled in any course. Enroll yourself in the next tab or contact your teacher.</h6>
                            </b-col>
                        </b-row>

                        <!--Course Cards-->
                        <b-row>
                            <b-col cols="6" v-for="course in filteredCourses" :key="course.id" class="d-flex align-items-stretch mb-3">

                                <!--Single Card-->
                                <b-card no-body class="w-100">
                                    <b-card-body class="d-flex flex-column">
                                        <div class="d-flex justify-content-between align-items-center mb-0">
                                            <h4 class="card-title m-0">{{ course.name }}</h4>
                                            <b-badge v-if="course.role" show variant="primary font-weight-bold">{{ course.role.toUpperCase() }}</b-badge>
                                        </div>
                                        <p class="card-title mt-0 text-muted">{{ course.academic_year }} - {{ course.faculty }} - {{ course.course_code }}</p>

                                        <div class="mb-auto">
                                            <p>{{ course.description | truncate(200)}}</p>
                                        </div>
                                        <div>
                                            <b-button   v-if="course.role === 'student'" variant="outline-primary" size="sm"
                                                        :to="{ name: 'student-dashboard.course.home', params: { courseId: course.id } }">
                                                Enter Course
                                            </b-button>
                                            <b-button   v-else-if="course.role === 'TA'" variant="outline-primary" size="sm"
                                                        :to="{ name: 'teaching-assistant-dashboard.course.home', params: { courseId: course.id } }">
                                                Enter Course
                                            </b-button>
                                            <b-button   v-else-if="course.role === 'teacher'" variant="outline-primary" size="sm"
                                                        :to="{ name: 'teacher-dashboard.course', params: { courseId: course.id } }">
                                                Enter Course
                                            </b-button>
                                        </div>
                                    </b-card-body>
                                </b-card>

                            </b-col>

                        </b-row>
                    </b-tab>

                    <!--Unenrolled Courses Tab-->
                    <b-tab title="Unenrolled Courses">

                        <!--Filter Input-->
                        <b-row>
                            <b-col class="mb-3" cols="6">
                                <b-form-group label="" description="Search a course">
                                    <b-input placeholder="Filter courses" v-model="filterUnenrolled"></b-input>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="Select the faculty">
                                    <b-form-select :options="faculties" v-model="filterOptions.faculty"></b-form-select>
                                </b-form-group>
                            </b-col>
                            <b-col class="mb-3" cols="3">
                                <b-form-group label="" description="The active academic year">
                                    <b-form-select :options="[academic_year_active]" v-model="academic_year_active"></b-form-select>
                                </b-form-group>
                            </b-col>
                        </b-row>

                        <!--No courses message-->
                        <b-row>
                            <b-col>
                                <h6 v-if="showNoUnenrolledCoursesText">You have been enrolled in all available courses at this moment.</h6>
                            </b-col>
                        </b-row>

                        <!--Course Cards-->
                        <b-row>
                            <b-col cols="6" v-for="course in filteredUnenrolledCourses" :key="course.id" class="d-flex align-items-stretch mb-3">

                                <!--Single Card-->
                                <b-card no-body class="mb-3 w-100">
                                    <b-card-body class="d-flex flex-column">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h4 class="card-title m-0">{{ course.name }}</h4>
                                        </div>
                                        <p class="card-title mt-0 text-muted">{{ course.academic_year }} - {{ course.faculty }} - {{ course.course_code }}</p>

                                        <div class="mb-auto">
                                            <p>{{ course.description | truncate(200)}}</p>
                                        </div>
                                        <div>
                                            <b-button variant="outline-primary" size="sm" @click="enrollInCourse(course.id)">
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
import api from '../../api'
import notifications from '../../mixins/notifications'
import CreateCourse from './CreateCourse'

export default {
    mixins: [notifications],
    components: {
        CreateCourse
    },
    data() {
        return {
            courses: [],
            unEnrolledCourses: [],
            courseRoles: [
                {
                    id: null,
                    role: ''
                }
            ],
            filter: "",
            filterOptions: {
                faculty: null,
                academic_year: null
            },
            filterUnenrolled: "",
            showCreateCourseButton: false,
            showNoCoursesText: false,
            showNoUnenrolledCoursesText: false,
            faculties: [],
            academic_years: [],
            academic_year_active: null
        }
    },
    computed: {
        filteredCourses() {
            return this.courses.filter(course => {
                return (course.name.toLowerCase().includes(this.filter.toLowerCase()) || this.filter === "")
                && (this.filterOptions.faculty == null || course.faculty === this.filterOptions.faculty)
                && (this.filterOptions.academic_year == null || course.academic_year === this.filterOptions.academic_year);
            })
        },
        filteredUnenrolledCourses() {
            return this.unEnrolledCourses.filter(course => {
                return (course.name.toLowerCase().includes(this.filterUnenrolled.toLowerCase()) || this.filterUnenrolled === "")
                && (this.filterOptions.faculty == null || course.faculty === this.filterOptions.faculty)
                && course.academic_year === this.academic_year_active
            })
        },

    },
    async created() {
        // Fetch courses that user has not yet enrolled in.
        await this.fetchUnenrolledCourses()

        // Fetch enrolled courses.
        await this.fetchCourses()

        // Fetch course roles.
        await this.fetchAllCourseRoles()

        // Fetch user to see if create course button should be showed.
        await this.fetchUser()

        await this.fetchAcademicYears();
        await this.fetchActiveAcademicYear();
        await this.fetchFaculties();
    },
    methods: {
        async fetchActiveAcademicYear() {
            try {
                let res = await api.getActiveAcademicYear();
                this.academic_year_active = res.data[0].year;
                this.filterOptions.academic_year = this.academic_year_active;
            } catch (e) {
                console.log(e);
            }
        },

        async fetchFaculties() {
            try {
                let res = await api.getFaculties();

                this.faculties = res.data.map(entry => { return { value: entry.name, text: entry.name }});
            } catch (e) {
                console.log(e)
            }
        },

        async fetchAcademicYears() {
            try {
                let res = await api.getAcademicYears();
                this.academic_years = res.data.map(entry => { return { value: entry.year, text: entry.year }});
            } catch (e) {
                console.log(e)
            }
        },

        async fetchUser() {
            let res = await api.getUser()
            if (res.data.user.affiliation === "employee" || res.data.user.affiliation.includes("employee")) {
                this.showCreateCourseButton = true
            } else {
                this.showCreateCourseButton = false
            }
        },
        async fetchCourses() {
            let res = await api.getEnrolledCourses()
            this.courses = res.data
            this.showNoCoursesText = (this.courses.length === 0)
        },
        async fetchAllCourseRoles() {
            for (let i = 0; i < this.courses.length; i++) {
                let res = await api.getCurrentRoleForCourse(this.courses[i].id)
                this.$set(this.courses[i], 'role', res.data.role)
            }
        },
        async fetchUnenrolledCourses() {
            try {
                const { data: unenrolledCourses } = await api.getUnenrolledCourses()
                this.unEnrolledCourses = unenrolledCourses
                this.showNoUnenrolledCoursesText = (this.unEnrolledCourses.length === 0)
            } catch (e) {
                this.showNoUnenrolledCoursesText = (this.unEnrolledCourses.length === 0)
                this.showErrorMessage({message: 'Could not fetch not yet enrolled courses.'})
            }
        },
        async enrollInCourse(courseId) {
            try {
                await api.enrollInCourse(courseId)
                this.showSuccessMessage({message: "Successfully enrolled in course."})
            } catch (e) {
                this.showErrorMessage({message: "Could not enroll you in this course."})
            }
            await this.fetchUnenrolledCourses()
            await this.fetchCourses()
            await this.fetchAllCourseRoles()
        }
    }
}
</script>

