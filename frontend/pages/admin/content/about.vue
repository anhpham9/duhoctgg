<template>
    <div>
        <h1>About Content</h1>
        <p>Admin about content management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>