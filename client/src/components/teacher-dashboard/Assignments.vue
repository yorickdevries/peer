<template>
    <div>
        <b-container>
            <!--Header with create button-->
            <BreadcrumbTitle :items="['Assignments']" class="mt-3">
                <b-button variant="success" :to="{ name: 'teacher-dashboard.assignments.createSimple' }"
                    >Create assignment</b-button
                >
            </BreadcrumbTitle>

            <!--Course Cards-->
            <b-row>
                <b-col cols="6" v-for="assignment in assignments" :key="assignment.id">
                    <b-card :title="assignment.name" class="mb-3">
                        <b-badge variant="secondary" class="ml-2 float-right p-1">
                            {{ assignment.state.toUpperCase() }}</b-badge
                        >
                        <p class="card-text">
                            {{ assignment.description }}
                        </p>
                        <b-button
                            variant="primary"
                            :to="{
                                name: 'teacher-dashboard.assignments.assignment',
                                params: { courseId: assignment.courseId, assignmentId: assignment.id },
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
import api from "../../api/api"
import BreadcrumbTitle from "../BreadcrumbTitle"

export default {
    components: { BreadcrumbTitle },
    data() {
        return {
            assignments: [],
        }
    },
    async created() {
        const res = await api.assignments.getAllForCourse(this.$route.params.courseId)
        this.assignments = res.data
    },
}
</script>
