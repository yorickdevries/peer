import VueNotifications from "vue-notifications/src/main"

export default {
    notifications: {
        showErrorMessage: {
            type: VueNotifications.types.error,
            title: "Error",
            message: "An error has occurred."
        },
        showSuccessMessage: {
            type: VueNotifications.types.success,
            title: "Success",
            message: "Action was successful."
        },
        showInfoMessage: {
            type: VueNotifications.types.info,
            title: "Info",
            message: "Info."
        },
        showWarningMessage: {
            type: VueNotifications.types.warn,
            title: "Warning",
            message: "Warning."
        },
        showSaveMessage: {
            type: VueNotifications.types.success,
            title: "Saved",
            message: "The item has successfully been saved."
        },
        showSubmitMessage: {
            type: VueNotifications.types.success,
            title: "Submitted",
            message: "The item has successfully been submitted."
        },
        showUnSubmitMessage: {
            type: VueNotifications.types.success,
            title: "Unsubmitted",
            message: "The item has successfully been unsubmitted."
        }
    }
}
