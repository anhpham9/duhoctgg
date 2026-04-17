<template>
    <div>
        <h1>Homepage Content</h1>
        <p>Admin homepage content management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>