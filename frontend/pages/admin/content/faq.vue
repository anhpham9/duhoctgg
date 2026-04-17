<template>
    <div>
        <h1>FAQ Content</h1>
        <p>Admin FAQ content management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>