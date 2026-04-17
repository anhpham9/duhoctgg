<template>
    <div>
        <h1>Profile</h1>
        <p>Admin profile management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>