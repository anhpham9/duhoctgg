<template>
    <div>
        <h1>News</h1>
        <p>Admin news management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>