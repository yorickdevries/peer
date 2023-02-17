<template>
    <b-card header="Settings">
        <div class="inline-parent">
            <b-badge
                v-b-tooltip.hover
                :title="preferences.stRemLateSubmission.explanation"
                class="mr-1"
                variant="primary"
                >?</b-badge
            >
            <b-form-checkbox :disabled="loading" v-model="preferences.stRemLateSubmission.value">
                Enable Deadline Warnings Emails
            </b-form-checkbox>
        </div>
        <div class="inline-parent">
            <b-badge
                v-b-tooltip.hover
                :title="preferences.stRemStageNotSubmitted.explanation"
                class="mr-1"
                variant="primary"
                >?</b-badge
            >
            <b-form-checkbox :disabled="loading" v-model="preferences.stRemStageNotSubmitted.value">
                Enable Late Review/Evaluation Emails
            </b-form-checkbox>
        </div>
    </b-card>
</template>

<style>
.inline-parent > * {
    display: inline-block;
}
</style>

<script>
import api from "../../api/api"

export default {
    props: ["user"],
    data() {
        return {
            preferences: {
                stRemStageNotSubmitted: {
                    value: null,
                    explanation:
                        "Sends reminder emails one day before a deadline if a submission/review/evaluation has not been submitted.",
                },
                stRemLateSubmission: {
                    value: null,
                    explanation:
                        "Sends an email whenever someone submits a review/evaluation after the deadline for your submission",
                },
            },
            loading: true,
        }
    },
    async created() {
        // Fetch user preferences
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            let res = await api.preferences.get()
            delete res.data["createdAt"]
            delete res.data["updatedAt"]
            delete res.data["id"]

            for (const [name, newValue] of Object.entries(res.data)) {
                this.preferences[name].value = newValue
            }

            this.loading = false
        },
    },
}
</script>
