<template>
    <b-modal
        id="sessionExpiredModal"
        title="Session expired."
        ref="sessionExpiredModal"
        @ok="hideSessionExpiredModal()"
        :ok-only="true"
        centered
    >
        <div>
            Your session has expired. <br />
            Click the button below to log back in. Do <b>not</b> close this page. <br />
            Afterwards, come back to this page and press OK to resume.
        </div>
        <b-button variant="primary" size="sm" class="my-3" href="/api/login" target="_blank">Login page</b-button>
    </b-modal>
</template>

<script>
// NOTE: This can be deleted once proper error handling has been achieved
import api from "../../api/api_temp"
import notifications from "../../mixins/notifications"

export default {
    name: "SessionCheck",
    mixins: [notifications],
    methods: {
        async sessionGuardCheck() {
            // Submit the peer review.
            try {
                const res = await api.getUserInfo()
                const user = res.data

                if (!user) {
                    this.$refs.sessionExpiredModal.show()
                    return false
                }
            } catch (error) {
                this.showErrorMessage({ message: "You are not logged in anymore, please log back in." })
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
