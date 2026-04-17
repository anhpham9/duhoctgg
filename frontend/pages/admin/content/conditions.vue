<template>
    <div>
        <h1>Conditions Content</h1>
        <p>Admin conditions content management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>