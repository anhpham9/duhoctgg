<template>
    <div>
        <h1>Schools Content</h1>
        <p>Admin schools content management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>