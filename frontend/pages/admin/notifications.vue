<template>
    <div>
        <h1>Notifications</h1>
        <p>Admin notifications management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>