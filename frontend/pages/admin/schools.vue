<template>
    <div>
        <h1>Schools Management</h1>
        <p>Schools page content here...</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"]
});
</script>