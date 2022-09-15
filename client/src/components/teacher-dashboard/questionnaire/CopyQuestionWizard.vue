<template>
    <div>
        <div class="text-muted">Copy questions from another questionnaire</div>
        <b-input-group class="mb-2" prepend="Year">
            <b-form-select v-model="selectedYear" @change="selectYear" :disabled="this.loading || step < 1">
                <b-form-select-option v-for="year in academicYears" :key="year.id" :value="year.id">
                    {{ year.name }}
                </b-form-select-option>
            </b-form-select>
        </b-input-group>
        <b-input-group class="mb-2" prepend="Course">
            <b-form-select v-model="selectedCourse" @change="selectCourse" :disabled="this.loading || step < 2">
                <b-form-select-option
                    v-for="enrollment in activeEnrollments"
                    :key="enrollment.course.id"
                    :value="enrollment.course.id"
                    >{{ enrollment.course.name }}</b-form-select-option
                >
            </b-form-select>
        </b-input-group>
        <b-input-group class="mb-2" prepend="Questionnaire">
            <template #append>
                <b-button :disabled="selectedQuestionnaire === null" @click="requestCopy" variant="primary"
                    >Copy</b-button
                >
            </template>
            <b-form-select v-model="selectedQuestionnaire" :disabled="this.loading || step < 3">
                <b-form-select-option
                    v-for="questionnaire in allQuestionnairesOfCourse"
                    :key="questionnaire.id"
                    :value="questionnaire"
                    >{{ questionnaire.name }}</b-form-select-option
                >
            </b-form-select>
        </b-input-group>
    </div>
</template>

<script>
import api from "@/api/api"
import notifications from "@/mixins/notifications"

export default {
    props: ["type", "questionnaire"],
    mixins: [notifications],
    name: "CopyQuestionWizard",
    data() {
        return {
            academicYears: [],
            enrollments: [],
            allQuestionnairesOfCourse: [],
            loading: true,
            selectedYear: null,
            selectedCourse: null,
            selectedQuestionnaire: null,
            step: 1
        }
    },
    computed: {
        activeEnrollments() {
            //find courses we are a teacher in matching the selected academic year
            return this.selectedYear
                ? this.enrollments.filter(e => e.role === "teacher" && e.course.academicYear.id === this.selectedYear)
                : null
        }
    },
    async created() {
        await this.fetchData()
        this.loading = false
        //select the year of the current course
        const course = this.enrollments.find(e => e.course.id.toString() === this.$route.params.courseId).course
        this.selectedYear = course.academicYear.id
        this.selectYear()
        //select the current course
        this.selectedCourse = course.id
        this.selectCourse()
    },
    methods: {
        async fetchData() {
            await this.fetchAcademicYears()
            await this.getAllEnrolledTaughtCourses()
        },
        async requestCopy() {
            if (this.type === "submission") {
                await api.submissionquestionnaires.copyQuestions(this.questionnaire.id, this.selectedQuestionnaire.id)
            } else {
                await api.reviewquestionnaires.copyQuestions(this.questionnaire.id, this.selectedQuestionnaire.id)
            }
            this.showSuccessMessage({ message: "Questions copied successfully" })
            this.$emit("copyQuestionSuccess")
        },
        selectYear() {
            this.step = 2
            this.selectedCourse = null
            this.selectedQuestionnaire = null
        },
        selectCourse() {
            this.step = 3
            this.selectedQuestionnaire = null
            this.loading = true
            this.getAllQuestionnairesOfCourse().then(() => {
                this.loading = false
            })
        },
        async getAllEnrolledTaughtCourses() {
            const res = await api.enrollments.getEnrolledCourses()
            this.enrollments = res.data
        },
        async fetchAcademicYears() {
            const res = await api.academicyears.get()
            this.academicYears = res.data
        },
        async getAllQuestionnairesOfCourse() {
            const res = await api.assignments.getAllForCourse(this.selectedCourse)
            const allAssignmentsOfCourse = res.data
            // iterate over assignments
            this.allQuestionnairesOfCourse = []
            for (const assignment of allAssignmentsOfCourse) {
                for (const assignmentVersion of assignment.versions) {
                    if (
                        assignmentVersion.submissionQuestionnaireId &&
                        assignmentVersion.submissionQuestionnaireId !== this.questionnaire.id
                    ) {
                        this.allQuestionnairesOfCourse.push({
                            name: assignment.name + "-" + assignmentVersion.name + " (submissionquestionnaire)",
                            id: assignmentVersion.submissionQuestionnaireId,
                            qType: "submission"
                        })
                    }
                    if (
                        assignmentVersion.reviewQuestionnaireId &&
                        assignmentVersion.reviewQuestionnaireId !== this.questionnaire.id
                    ) {
                        this.allQuestionnairesOfCourse.push({
                            name: assignment.name + "-" + assignmentVersion.name + " (reviewquestionnaire)",
                            id: assignmentVersion.reviewQuestionnaireId,
                            qType: "review"
                        })
                    }
                }
            }
            this.loading = false
        }
    }
}
</script>
