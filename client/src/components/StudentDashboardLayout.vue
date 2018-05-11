<template>
    <div>
        <h1>Student Dashboard</h1>
        <nav>
            <p><router-link to="/dashboard/">Main page</router-link></p>
            <p><router-link to="/dashboard/courses">Courses</router-link></p>
        </nav>
        <router-view></router-view>
        <footer>Footer</footer>
    </div>
</template>

<script>
export default {
    name: "StudentDashboard"
}
</script>

<style scoped>

</style>