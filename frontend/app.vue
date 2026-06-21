<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { persistClientSiteSettings } from '~/utils/siteSettings'

const config = useRuntimeConfig()

onMounted(async () => {
    try {
        const response = await fetch(`${config.public.apiBase}/public/general-settings`, {
            method: 'GET'
        })
        const data = await response.json()

        if (!response.ok) {
            return
        }

        persistClientSiteSettings(data?.data || {})
    } catch {
        // Ignore fetch errors and keep default local settings.
    }
})
</script>