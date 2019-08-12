<template>
    <b-modal id="sessionExpiredModal"
             title="Session expired."
             ref="sessionExpiredModal"
             @ok="hideSessionExpiredModal()"
             :ok-only="true"
             centered>
        <div>
            Your session has expired and you might lose your current progress.
            Please log back in here:
        </div>
        <b-button variant="primary" size="sm" class="mt-3" href="/api/login" target="_blank">Log in page.</b-button>
    </b-modal>
</template>

<script>
    import api from "../../api"

    export default {
        name: "SessionCheck",
        methods: {
            async sessionGuardCheck() {
                // Submit the peer review.
                try {
                    const res = await api.getUser()
                    const user = res.data

                    if (!user) {
                        this.$refs.sessionExpiredModal.show()
                        return false
                    }
                } catch (error) {
                    this.showErrorMessage({message: "You are not logged in anymore, please log back in."})
                    return false
                }
                return true
            },
            hideSessionExpiredModal() {
                this.$refs.sessionExpiredModal.hide()
            }
        }
    }
</script>
