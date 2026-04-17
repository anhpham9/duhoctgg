<template>
    <div>
        <h1>News Content</h1>
        <p>Admin news content management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>