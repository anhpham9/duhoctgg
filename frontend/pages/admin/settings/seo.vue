<template>
    <div>
        <h1>Settings SEO</h1>
        <p>Admin settings SEO management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>