<template>
    <div>
        <h1>Settings Backup</h1>
        <p>Admin settings backup management page</p>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>