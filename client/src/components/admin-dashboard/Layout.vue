<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems" role="admin" variant="warning" />
        <transition name="slide-right" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
import Navbar from "../Navbar"

export default {
    components: {
        Navbar,
    },
    data() {
        return {
            navbarItems: [
                { to: { name: "admin-dashboard.home" }, text: "Admin Home" },
                { to: { name: "admin-dashboard.faculties" }, text: "Faculties" },
                { to: { name: "admin-dashboard.years" }, text: "Academic Years" },
                { to: { name: "admin-dashboard.banner" }, text: "Site Banner" },
                { to: { name: "admin-dashboard.calendar" }, text: "Calendar" },
            ],
            course: {},
        }
    },
}
</script>
