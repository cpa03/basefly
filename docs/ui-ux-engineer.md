# UI/UX Engineer Memory

## Project: Basefly (Next.js SaaS Template)

## Work History

### 2026-02-25: Additional Reduced Motion Support (PR #639)

**Research Findings**:
- `infinite-moving-cards.tsx` used CSS animation (`animate-scroll`) without reduced motion support
- `meteors.tsx` used CSS animation (`animate-meteor-effect`) without reduced motion support
- Both are marketing effect components used on landing pages

**Components Fixed**:
1. **infinite-moving-cards.tsx** - Added `motion-reduce:animate-none` Tailwind class
2. **meteors.tsx** - Added `motion-reduce:animate-none` Tailwind class

---

### 2026-02-25: Accessibility Improvements (Issue #484)

### 2026-02-25: Accessibility Improvements (Issue #484)

**Issue**: frontend: Improve accessibility with consistent ARIA implementation

**Research Findings**:
- Modal components - Well implemented with aria-label, aria-labelledby, aria-describedby
- Dialog components - Has aria-label for close button
- Button component - Has aria-busy for loading state
- Input component - Has aria-invalid and aria-label for clear button
- Navbar - Has aria-current for active links (excellent!)
- Form - Has aria-describedby and aria-invalid (excellent!)
- Skip-link - Well implemented with focus management
- Toast - Has aria-label and aria-hidden
- Alert - Has role="alert" (excellent!)
- Sheet - Missing aria-modal="true" (needs fix)

**Implemented Fixes**:
1. Added aria-modal="true" to SheetContent component
2. Added aria-labelledby for title and aria-describedby for description

### 2026-02-25: Reduced Motion Support for Animations

**Issue**: Multiple UI components use framer-motion and CSS animations without respecting `prefers-reduced-motion` OS settings

**Research Findings**:
- 14 components use framer-motion for animations
- Only 1 component (copy-button.tsx) had reduced motion support
- Tooltip component uses Tailwind's motion-safe/motion-reduce classes
- 13 components lacked reduced motion support entirely

**Components Fixed**:
1. **animated-tooltip.tsx** - Added useReducedMotion hook, simplified animations
2. **sparkles.tsx** - Added useReducedMotion, disabled particle animations
3. **animated-list.tsx** - Added useReducedMotion, shows all items instantly
4. **marquee.tsx** - Added motion-reduce:animate-none Tailwind class
5. **animated-gradient-text.tsx** - Added motion-reduce:animate-none Tailwind class

**Implementation Approaches**:
- **Framer-motion components**: Use `useReducedMotion()` hook from framer-motion
- **CSS animations**: Use Tailwind's `motion-reduce:animate-none` class variant
- **tsParticles**: Set animation speed to 0 when reduced motion is preferred

## Patterns Identified

### Good Accessibility Practices in Codebase:
1. Using Radix UI primitives which have built-in accessibility
2. Proper use of aria-invalid for form validation
3. aria-describedby for connecting inputs to error messages
4. aria-current for active navigation links
5. Skip links for keyboard navigation
6. Loading states with aria-busy
7. role="alert" for important error messages

### Key Components Location:
- UI components: `packages/ui/src/`
- App components: `apps/nextjs/src/components/`

## Notes

- This is a disciplined codebase with good accessibility practices already in place
- Most improvements needed are incremental additions to existing patterns
- Radix UI primitives handle most heavy lifting for accessibility
- prefer-reduced-motion support is important for users with vestibular disorders
- Use framer-motion's `useReducedMotion()` hook for React animation components
- Use Tailwind's `motion-reduce:` variant for CSS animations
