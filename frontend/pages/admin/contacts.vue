<template>
  <div>
    <h1>Contact Management</h1>
    <p>Admin contacts management page</p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
  ssr: false
});
</script>