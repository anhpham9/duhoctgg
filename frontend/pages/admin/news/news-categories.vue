<template>
    <div>
        <h1>News Categories</h1>
        <p>Admin news categories management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>