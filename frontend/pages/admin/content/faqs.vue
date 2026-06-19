<script setup>
definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

await navigateTo('/admin/faqs', { redirectCode: 301 })
</script>