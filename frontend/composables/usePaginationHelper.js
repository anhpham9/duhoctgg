// usePaginationHelper.js
// Reusable pagination helper composable for Nuxt 3/Vue 3
import { computed } from 'vue'

/**
 * Pagination helper for visible page numbers (with ... for large sets)
 * @param {import('vue').Ref<number>} totalPages - Total number of pages
 * @param {import('vue').Ref<number>} currentPage - Current page
 * @returns {import('vue').ComputedRef<(number|string)[]>}
 */
export function useVisiblePages(totalPages, currentPage) {
    return computed(() => {
        const pages = []
        const total = totalPages.value
        const current = currentPage.value

        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)
            if (current > 4) pages.push('...')
            const start = Math.max(2, current - 1)
            const end = Math.min(total - 1, current + 1)
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            if (current < total - 3) pages.push('...')
            if (total > 1) pages.push(total)
        }
        return pages
    })
}
