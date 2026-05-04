# Accessibility Documentation

This document outlines the accessibility features implemented in the RDI Recruiter Module, barriers addressed, and recommendations for future improvements.

## Overview

The RDI Recruiter Module is designed with accessibility as a core requirement, following WCAG 2.1 guidelines to ensure the application is usable by people with a wide range of abilities.

## Barriers Addressed

### P1 (Critical) - Must Fix

| Barrier | Affected Users | Fix Implemented |
|---------|---------------|-----------------|
| Missing skip links | Keyboard users, screen reader users | Added skip-to-content link on all pages |
| No focus indicators | Keyboard users, low vision users | Visible focus rings on all interactive elements |
| Missing form labels | Screen reader users | All inputs have associated `<label>` elements |
| No error announcements | Screen reader users | Error messages use `role="alert"` and `aria-live` |
| No keyboard navigation | Motor impaired users | All interactive elements are keyboard accessible |

### P2 (High) - Should Fix

| Barrier | Affected Users | Fix Implemented |
|---------|---------------|-----------------|
| Low contrast text | Low vision users, color blind users | Minimum 4.5:1 contrast ratio for all text |
| Missing button descriptions | Screen reader users | Descriptive button text and `aria-label` attributes |
| No confirmation for destructive actions | All users | Confirmation dialogs for reject action |
| Form data loss on errors | All users | Form values preserved when validation errors occur |
| Missing page structure | Screen reader users | Proper heading hierarchy and landmark regions |

### P3 (Medium) - Nice to Have

| Barrier | Affected Users | Fix Implemented |
|---------|---------------|-----------------|
| No loading state announcements | Screen reader users | Loading states with `aria-busy` |
| Missing status indicators | Screen reader users | Status badges with clear labels |
| No search suggestions | Cognitive disability users | Search with debounced results |

## Implemented Features

### Keyboard Navigation

- **Tab Navigation**: All interactive elements (links, buttons, form inputs) are reachable via Tab key
- **Focus Management**: 
  - Visible focus indicators with 2px ring offset
  - Focus trapped in modals and dialogs
  - Focus returned to trigger element after modal closes
- **Skip Links**: "Skip to main content" link available on all pages for keyboard users
- **Shortcut Keys**: 
  - `Escape` closes modals and dropdowns
  - `Enter` activates buttons and links
  - `Space` activates buttons

### Screen Reader Support

- **ARIA Labels**: All interactive elements have descriptive labels
- **Live Regions**: Dynamic content updates announced via `aria-live` regions
- **Landmarks**: Proper use of `<main>`, `<nav>`, and `<header>` elements
- **Headings**: Logical heading hierarchy (h1 → h2 → h3)
- **Status Announcements**: Success/error messages announced automatically

### Visual Design

- **Color Contrast**: 
  - Normal text: 4.5:1 minimum
  - Large text: 3:1 minimum
  - UI components: 3:1 minimum
- **Focus Indicators**: High-contrast focus rings (2px blue outline)
- **Status Colors**: Combined with text labels (not color-only)
- **Text Sizing**: Relative units (rem) for zoom support

### Form Accessibility

- **Labels**: All inputs have associated `<label>` elements
- **Error Messages**: 
  - Inline validation with clear error text
  - Errors linked to inputs via `aria-describedby`
  - Error announcements via `role="alert"`
- **Required Fields**: Marked with visual indicator and `aria-required`
- **Input Recovery**: Form values preserved on validation errors

### Dialog/Modal Accessibility

- **Focus Trap**: Focus contained within modal when open
- **Escape Key**: Modal closes on Escape key press
- **Click Outside**: Clicking backdrop closes modal
- **ARIA Attributes**: 
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby` pointing to title

### Components

#### Button Component
- Keyboard accessible (Enter/Space activation)
- Focus visible state
- Loading state with `aria-busy`
- Disabled state with `aria-disabled`

#### Input Component
- Associated label element
- Error message linked via `aria-describedby`
- `aria-invalid` for validation state
- Helper text support

#### Alert Component
- `role="alert"` for error variants
- `aria-live="polite"` for non-critical alerts
- Dismissible with keyboard

#### Select Component
- Associated label element
- Keyboard navigation (arrow keys, Enter, Escape)
- `aria-expanded` state

#### Pagination Component
- `aria-label` for navigation
- `aria-current="page"` for current page
- Previous/Next buttons with descriptive labels

#### ConfirmDialog Component
- Focus trap implementation
- Focus on primary action button on open
- Escape key to cancel
- `role="dialog"` and `aria-modal`

## Testing Checklist

Use this checklist to verify accessibility:

### Keyboard Testing
- [ ] Tab through entire page - all interactive elements reachable
- [ ] Focus indicators visible on all elements
- [ ] Skip link works and is visible on focus
- [ ] Modal traps focus and returns focus on close
- [ ] Escape key closes modals and dropdowns

### Screen Reader Testing
- [ ] All images have alt text or are hidden from AT
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Status changes announced
- [ ] Page title and headings make sense

### Visual Testing
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Information not conveyed by color alone
- [ ] Text readable at 200% zoom
- [ ] Focus indicators visible

## Known Limitations

1. **Drag and Drop**: The pipeline board uses buttons for moving cards instead of drag-and-drop for better keyboard accessibility
2. **Real-time Updates**: Status changes require page refresh for full synchronization
3. **Mobile**: Some complex tables may require horizontal scrolling on small screens

## Future Improvements

### P1 Recommendations
- Add automated accessibility testing (axe-core, jest-axe)
- Implement reduced motion preferences
- Add more comprehensive ARIA live regions for dynamic content

### P2 Recommendations
- Add breadcrumb navigation for better wayfinding
- Implement search with autocomplete
- Add print styles for better print experience

### P3 Recommendations
- Add dark mode for low-light preferences
- Implement voice navigation support
- Add tooltips for icon-only buttons

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Contact

For accessibility feedback or issues, please contact the development team.

---

**Last Updated**: 2024
**WCAG Version**: 2.1 Level AA
**Compliance Target**: AA
