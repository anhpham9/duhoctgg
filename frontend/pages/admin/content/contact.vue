<template>
    <div>
        <h1>Contact Content</h1>
        <p>Admin contact content management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>