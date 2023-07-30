export default {
    checkError(to, next, error) {
        if (error.response && error.response.status === 401 && error.response.data === "Please log in and try again") {
            // User is not logged in, wants to go to a restricted page
            // Store requested page and redirect to login
            localStorage.setItem("peerOrigPage", to.fullPath)
            window.location.href = "/api/login"
        } else {
            // User is logged in, wants to go to a restricted page, but is not allowed to
            // Redirect to home page
            next("/")
        }
    },
}
