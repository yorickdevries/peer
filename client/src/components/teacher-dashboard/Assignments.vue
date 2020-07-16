<template>
    <div>
        <b-container>
            <!--Header with create button-->
            <BreadcrumbTitle :items="['Assignments']" class="mt-3">
                <b-button variant="success" :to="{ name: 'teacher-dashboard.assignments.create' }"
                    >Create assignment</b-button
                >
            </BreadcrumbTitle>

            <!--Course Cards-->
            <b-row>
                <b-col cols="6" v-for="assignment in assignments" :key="assignment.id">
                    <b-card :title="assignment.title" :sub-title="assignment.title" class="mb-3">
                        <p class="card-text">
                            {{ assignment.description }}
                        </p>
                        <b-button
                            variant="primary"
                            :to="{
                                name: 'teacher-dashboard.assignments.assignment',
                                params: { courseId: assignment.course_id, assignmentId: assignment.id }
                            }"
                            >View assignment</b-button
                        >
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api_old"
import BreadcrumbTitle from "../BreadcrumbTitle"

export default {
    components: { BreadcrumbTitle },
    data() {
        return {
            id: null,
            assignments: []
        }
    },
    async created() {
        this.init()
    },
    methods: {
        async init() {
            let cid = this.$route.params.courseId
            this.cid = cid
            let res = await api.getCourseAssignments(cid)
            this.assignments = res.data
        }
    }
}
</script>
