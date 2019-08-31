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
        <b-button variant="primary" size="sm" class="my-3" href="/api/login" target="_blank">Login page</b-button>
        <div>
            After logging in, come back to this page and press the OK button to resume your session.
        </div>
    </b-modal>
</template>

<script>
    import api from "../../api"
    import notifications from '../../mixins/notifications'

    export default {
        name: "SessionCheck",
        mixins: [notifications],
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
                    this.$refs.sessionExpiredModal.show()
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
