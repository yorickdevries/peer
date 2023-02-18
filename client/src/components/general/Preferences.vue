<template>
    <b-card header="Settings">
        <div class="inline-parent mb-2" v-for="(pref, index) in this.preferences" :key="index">
            <b-badge v-b-tooltip.hover :title="pref.explanation" class="mr-2" variant="dark">?</b-badge>
            <b-form-checkbox :disabled="loading" v-model="pref.value">
                {{ pref.desc }}
            </b-form-checkbox>
        </div>
        <br />
        <b-button @click="save" size="sm">Save</b-button>
    </b-card>
</template>

<style>
.inline-parent {
    display: flex;
    flex-direction: row;
    align-items: center;
}
</style>

<script>
import api from "../../api/api"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    props: ["modalId"],
    data() {
        return {
            preferences: {},
            loading: true,
        }
    },
    async created() {
        // Fetch user preferences
        await this.fetchData()
    },
    methods: {
        async save() {
            const payload = []
            for (const [k, v] of Object.entries(this.preferences)) {
                payload.push({
                    name: k,
                    value: v.value,
                })
            }
            await api.preferences.post(payload)
            this.showSuccessMessage({ message: "Preferences saved" })
            this.$bvModal.hide(this.modalId)
        },
        async fetchData() {
            let res = await api.preferences.get()
            delete res.data.user["createdAt"]
            delete res.data.user["updatedAt"]
            delete res.data.user["id"]

            const newPreferences = {}

            for (const elem of res.data.base) {
                const prefName = elem.name
                newPreferences[prefName] = {}
                newPreferences[prefName].value = res.data.user[prefName]
                newPreferences[prefName].explanation = elem.explanation
                newPreferences[prefName].desc = elem.desc
            }

            this.preferences = newPreferences

            this.loading = false
        },
    },
}
</script>
