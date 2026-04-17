<template>
    <div>
        <h1>Settings General</h1>
        <p>Admin settings general management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>