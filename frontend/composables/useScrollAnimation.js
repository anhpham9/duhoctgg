// Scroll Animation Composable
export const useScrollAnimation = () => {
    const animateOnScroll = (selectors = ['.service-card', '.school-card', '.why-choose-text', '.fee-text', '.about-text']) => {
        const elements = document.querySelectorAll(selectors.join(', '))
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top
            const elementVisible = 150
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate-fade-in-up')
            }
        })
    }

    const observeElements = (selectors = ['.service-card', '.school-card', '.why-choose-text', '.fee-text', '.about-text']) => {
        // Use Intersection Observer for better performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up')
                    observer.unobserve(entry.target)
                }
            })
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        })

        const elements = document.querySelectorAll(selectors.join(', '))
        elements.forEach(element => {
            observer.observe(element)
        })

        return observer
    }

    return {
        animateOnScroll,
        observeElements
    }
}