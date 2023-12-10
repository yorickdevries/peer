<template>
    <div>
        <b-card v-if="!assignment || assignment.versions.length === 0">No assignment versions available.</b-card>
        <div v-else-if="assignment.versions.length === 1">
            <Submission
                :assignmentVersion="assignment.versions[0]"
                :assignmentVersionId="assignment.versions[0].id"
                @shortcut-save="onChanged"
            ></Submission>
        </div>
        <div v-else>
            <b-card no-body>
                <b-alert v-if="assignment.versions.length > 1" show
                    >Select the right assignment version for your submission</b-alert
                >
                <hr />
                <b-tabs card lazy>
                    <b-tab>
                        <template slot="title">
                            <div class="d-flex align-items-center">Select</div>
                        </template>
                        <b-alert show>Please select your assignment version above</b-alert>
                    </b-tab>
                    <b-tab v-for="(assignmentVersion, index) in assignment.versions" :key="assignmentVersion.id">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge variant="warning" class="mr-2"
                                    >{{ assignmentVersion.name }} #{{ index + 1 }}</b-badge
                                >
                            </div>
                        </template>
                        <Submission @shortcut-save="onChanged" :assignmentVersionId="assignmentVersion.id"></Submission>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
import Submission from "./Submission"
import api from "../../../api/api"

export default {
    components: {
        Submission,
    },
    data() {
        return {
            assignment: null,
            changed: false,
        }
    },
    async created() {
        const res = await api.assignments.get(this.$route.params.assignmentId)
        this.assignment = res.data
        window.addEventListener("beforeunload", this.beforeWindowUnload)
    },

    beforeDestroy() {
        window.removeEventListener("beforeunload", this.beforeWindowUnload)
    },
    methods: {
        onChanged() {
            this.changed = true
        },
        confirmLeave() {
            return window.confirm("Do you really want to leave? You still have unsaved changes.")
        },
        isFormDirty() {
            return this.changed
        },
        confirmStayInDirtyForm() {
            return this.isFormDirty() && !this.confirmLeave()
        },

        beforeWindowUnload(e) {
            if (this.confirmStayInDirtyForm()) {
                // Cancel the event
                e.preventDefault()
                // Chrome requires returnValue to be set
                e.returnValue = ""
            }
        },
    },
    beforeRouteLeave(to, from, next) {
        if (this.confirmStayInDirtyForm()) {
            next(false)
        } else {
            next()
        }
    },
}
</script>
