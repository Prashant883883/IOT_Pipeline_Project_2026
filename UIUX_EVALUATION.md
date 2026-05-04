# UI/UX Evaluation Methods Report

**RDI Recruiter Module — ICT Project 2026**
**LAB University of Applied Sciences**
**Bachelor of Engineering, Industrial Information Technology**

**Author:** Prashant Bhandari  
**Completion Year:** 2026  
**Number of Pages:** 7

---

## Table of Contents

- Abstract
- 1. Introduction
- 2. Method from PDF A — Accessibility Testing
- 3. Method from PDF B — Heuristic Evaluation
- 4. Method from PDF C — Guerrilla Testing
- 5. Method from PDF D — User Flows
- 6. Summary
- 7. Conclusion

---

## Abstract

This report is written for the ICT Project 2026 module at LAB University of Applied Sciences. It reviews the UI/UX evaluation methods from the course material and selects the most suitable method from each of the five methods of UI/UX design, documented for the RDI Recruiter Module.

The RDI Recruiter Module is a full-stack web application that allows recruitment teams to manage student proposals, track candidates through hiring pipeline stages, and gain insights using machine learning. Recruiters access a dashboard to view proposals, move candidates between stages (NEW → SHORTLISTED → INTERVIEW → SELECTED), add private notes, and view analytics.

Because the system handles sensitive hiring data and must work across different devices and network conditions, accessibility, consistency, and data integrity are critical evaluation concerns. This report explains which evaluation methods were chosen, why they fit this project, and why alternative methods were not selected.

---

## 1. Introduction

The RDI Recruiter Module is a web-based application built with Next.js 14, TypeScript, Prisma ORM, and SQLite. It serves two distinct user groups:

**Recruiters:** Log into a dashboard, view student proposals, drag candidates through pipeline stages, add private notes, and monitor analytics and ML-driven insights.

**Students:** Register, submit proposals with skills and experience, track their application status, and receive feedback from recruiters.

The system is accessed through a web browser on desktop and mobile devices. Data consistency is critical — status changes must be audited, recruiter notes must remain private, and the database must never lose information during network interruptions.

Choosing the right UI/UX evaluation methods requires understanding the project's constraints:

- **Remote/async usage:** Users may work from different locations, so training is limited.
- **Sensitive data:** Hiring information requires clear access controls and audit trails.
- **Cross-device:** Must work on desktop (recruiters) and mobile (students checking status).
- **Compliance:** Status changes must be traceable for legal and fairness reasons.

This report selects one method from each course PDF, explains why it fits, and notes why other methods were not chosen.

---

## 2. Method from PDF A — Accessibility Testing

### What is Accessibility Testing?

Accessibility testing checks whether a system can be used by people with different physical, cognitive, and sensory abilities. It follows guidelines such as WCAG (Web Content Accessibility Guidelines), which cover text readability, colour contrast, keyboard navigation, clear labels, error messages, and screen reader support.

### Why It Suits This Project

The RDI Recruiter Module is used by recruitment teams that may include people with different abilities. Recruiters may have visual impairments, hearing loss, or mobility limitations. Students checking their status may be using screen readers or keyboard-only navigation.

A formal accessibility review would check:

- **Keyboard Navigation:** Can all functions (viewing proposals, changing status, adding notes) be completed without a mouse?
- **Colour Contrast:** Do the status badges (NEW, SHORTLISTED, SELECTED, REJECTED) meet WCAG AA standards?
- **Screen Reader Support:** Are form labels properly associated? Does the pipeline board communicate status changes to assistive technology?
- **Mobile Accessibility:** On small screens, are buttons large enough? Is the touch target area sufficient?
- **Error Messages:** If a status change fails, is the error clear and actionable?
- **Focus Management:** When a modal opens (confirm status change, add note), does focus move to the modal?

The project already made several accessibility decisions — semantic HTML, proper form labels, and skip links in the navigation. A formal review would confirm what works and identify gaps.

### Why the Other PDF A Methods Were Not Chosen

- **A/B Testing:** Requires large numbers of real users split into groups. A student project with demo accounts cannot run meaningful A/B tests.
- **Data Analytics:** Requires weeks of genuine recruitment workflow usage. Demo data does not reflect real recruiter behaviour.
- **Eye-Tracking:** Needs specialist equipment. Also most useful for visually complex screens — the RDI dashboard is intentionally clean and minimal.
- **User Testing with Think-Aloud Protocol:** While valuable, recruiting real recruiters is not feasible for a student project, and think-aloud sessions are time-consuming to arrange and analyze.

---

## 3. Method from PDF B — Heuristic Evaluation

### What is Heuristic Evaluation?

Heuristic Evaluation is an expert-based method where an evaluator reviews an interface against recognized usability principles called heuristics. Nielsen's 10 Heuristics are the most well-known, covering visibility of system status, error prevention, consistency, user control and freedom, help and documentation, and others.

### Why It Suits This Project — And How It Was Applied

Heuristic Evaluation is ideal for this project because:

- It can be done by a single evaluator without recruiting participants.
- It works on a fully built, functional system.
- It produces clear, actionable findings that can be directly turned into improvements.
- Hiring workflows are well-understood, so an expert can evaluate against established usability principles.

**Application to RDI Recruiter Module:**

The evaluation checked each recruiter screen (proposals, pipeline, analytics, settings) and student screen (login, view status, receive notifications) against Nielsen's 10 heuristics.

**Findings and Fixes:**

| Heuristic | Finding | Fix |
|-----------|---------|-----|
| **H1 — Visibility of System Status** | Pipeline board did not show loading state when dragging candidates | Added spinner and "Saving..." feedback during status updates |
| **H2 — Match System to Real World** | Status names (UNDER_REVIEW, SHORTLISTED) matched recruiter language | No change — already aligned |
| **H3 — User Control and Freedom** | Logout was not visible on every page | Added logout button to persistent navigation bar |
| **H4 — Consistency and Standards** | Button styles were inconsistent (some filled, some outlined) | Standardized button component across all pages |
| **H5 — Error Prevention** | No confirmation dialog before rejecting a candidate | Added "Are you sure?" modal before irreversible actions |
| **H6 — Recognition Over Recall** | Proposal details page required scrolling to see all sections | Reorganized into visible tabs without scrolling |
| **H7 — Flexibility and Efficiency** | No keyboard shortcuts for power users | Recorded as future improvement (Tab to navigate, Enter to confirm) |
| **H8 — Aesthetic and Minimalist** | Dashboard showed too many columns by default on narrow screens | Implemented responsive layout that hides less important columns on mobile |
| **H9 — Help Recover from Errors** | Wrong form submissions showed generic "Error" message | Updated to show specific error (e.g., "Email already exists") |
| **H10 — Help and Documentation** | New recruiters did not know the status workflow | Added Help modal with workflow diagram and step-by-step guide |

These results show that Heuristic Evaluation produced genuine improvements — not just theoretical recommendations.

### Why the Other PDF B Methods Were Not Chosen

- **Design Sprint:** A five-day team workshop for early-stage design problems. This project is built and complete, so a sprint is not applicable.
- **AttrakDiff:** Measures emotional and aesthetic appeal — useful for consumer apps, less relevant for a functional workplace tool focused on data and compliance.
- **Trunk Test:** Checks navigation orientation by hiding context. The RDI dashboard has clear navigation hierarchy (Dashboard → Proposals/Pipeline/Analytics), so this adds little value.

---

## 4. Method from PDF C — Guerrilla Testing

### What is Guerrilla Testing?

Guerrilla Testing is an informal, low-cost usability method where feedback is collected quickly from people in everyday settings. Participants are approached informally and asked to complete one or two key tasks. The goal is to catch obvious usability problems early without needing a formal lab or scheduled sessions.

### Why It Suits This Project

Guerrilla Testing is the most realistic form of user feedback available for a solo student project. A classmate, university staff member, or mentor can be given access to a demo account and asked to complete realistic tasks:

**Recruiter Tasks:**
- "You received a new proposal from a student. Review it and move them to SHORTLISTED if they look promising."
- "Add a private note to this candidate."
- "Find all candidates who are currently in the INTERVIEW stage."

**Student Tasks:**
- "Register as a new student and submit a proposal."
- "Log in and check the status of your application."

Because testers have no prior knowledge of how the system works, they represent exactly the right condition — a first-time user.

**What Guerrilla Testing Would Reveal:**

- Whether the proposal layout is immediately understandable.
- Whether dragging a candidate to a new column feels intuitive or confusing.
- Whether the confirmation modal language is clear ("Move to SHORTLISTED?" vs. "Are you sure?").
- Whether students understand how to check their status.
- Whether error messages are clear when something goes wrong.
- Which features testers cannot find without help.

These are exactly the problems that expert evaluation alone cannot catch — they only appear when someone unfamiliar with the system uses it for the first time.

### Why the Other PDF C Methods Were Not Chosen

- **Crazy 8's:** An ideation method used before building — not an evaluation tool for a finished system.
- **UX Prototyping:** Was done during development, but applying it formally now would mean rebuilding something that already works.
- **Six Thinking Hats:** A group facilitation method for teams — loses value when used by a solo developer.
- **Five-Second Test:** Checks first visual impressions (does the dashboard look professional?). The RDI interface would pass trivially and reveal nothing useful.

---

## 5. Method from PDF D — User Flows

### What Are User Flows?

User Flows are visual diagrams that map every step a user takes to complete a task. They show the starting point, each interaction or decision along the way, possible error paths, alternative routes, and the end result. They make the interaction logic of a system visible and easy to review.

### Why It Suits This Project

The RDI Recruiter Module has three distinct user journeys, each with branching logic:

**1. Recruiter Onboarding Flow:**
- Register or login → Confirm email → View proposal list → Complete

**2. Recruiter Proposal Review Flow:**
- View proposal → Read full details → Add note → Change status → View audit trail → Move to next proposal

**3. Student Application Status Flow:**
- Register → Submit proposal → Wait for initial review → (Rejected) OR → Receive interview invitation → (Selected) OR → Receive offer

Drawing these as flow diagrams makes edge cases visible. For example:

- What happens if a recruiter tries to reject a candidate who is already SELECTED?
- What if a network error occurs while saving a status change?
- What if two recruiters try to change the same candidate's status at the same time?

**User Flows also serve as:**
- Documentation for anyone maintaining or extending the system.
- Training material for new recruiter team members.
- Compliance records (showing the intended workflow).

### Why the Other PDF D Methods Were Not Chosen

- **Concept Testing:** Used before building to validate the idea — too early-stage for a completed project.
- **Kano Analysis:** Helps teams prioritize which features to build next, but the project scope is already decided.
- **Jobs to Be Done:** Confirms the job the system was designed around (manage recruitment pipeline), so it produces no new evaluation findings.
- **Card Sorting:** Helps design navigation structures, but the RDI navigation is already clear (Dashboard → Proposals, Pipeline, Analytics, Settings).

---

## 6. Summary

| PDF | Chosen Method | Status | Main Reason |
|-----|---------------|--------|------------|
| A | Accessibility Testing | Recommended | Recruitment teams include people with diverse abilities; WCAG covers keyboard navigation, screen readers, colour contrast |
| B | Heuristic Evaluation | Applied — Primary | Expert-based, solo-applicable, produced 10 real UI improvements during development |
| C | Guerrilla Testing | Recommended | No lab or permissions needed; tests real first-time user behaviour on core workflows quickly and cheaply |
| D | User Flows | Recommended | Maps all three user journeys, shows edge cases, documents intended workflow and error handling |

**Secondary Method Used:**

Cognitive Walkthrough was used as the secondary evaluation method during development. The developer stepped through each task from a new recruiter's perspective and asked: "Would someone unfamiliar with recruitment workflows understand what to do at this point?" This was especially important for explaining the status workflow to first-time users.

---

## 7. Conclusion

The RDI Recruiter Module is a data-driven business application with strict requirements for accuracy, compliance, and usability. Unlike consumer apps, the focus is not on delight or emotional connection, but on helping recruiters make fair decisions and giving students transparency into the hiring process.

### Key Findings:

**Heuristic Evaluation** was the right primary method because it was practical for a solo developer, could be applied to the finished system, and produced 10 real, implementable improvements. It confirmed that the system follows established usability principles and highlighted specific areas for refinement.

**Cognitive Walkthrough** worked well as a secondary method to think through first-time users' perspectives — essential for explaining the candidate status workflow, which has no analogue in everyday consumer apps.

### Recommended Next Steps:

1. **Accessibility Testing (High Priority):** A formal WCAG review by someone trained in accessibility standards would ensure the system works for recruiters and students with diverse abilities. Given the sensitive nature of hiring decisions, ensuring fair access is both an ethical and legal concern.

2. **Guerrilla Testing (Medium Priority):** Ask 3–5 people unfamiliar with the system to complete realistic recruiter and student tasks. Document where they struggle, what confuses them, and what they find intuitive. This will reveal gaps that heuristic evaluation cannot catch.

3. **User Flows Documentation (Medium Priority):** Draw out the three main user journeys (recruiter onboarding, proposal review, student status tracking) as visual flow diagrams. This creates permanent documentation and makes edge cases (network errors, concurrent edits, permission checks) explicit.

4. **Performance Testing (Future):** Monitor dashboard load times and API response times under realistic data volumes. Recruiters expecting to view 1000+ proposals need the system to remain responsive.

### Final Thoughts:

Together, these four methods — one already applied as primary, one as secondary, and two recommended for future use — give a thorough picture of how UI/UX evaluation fits the RDI Recruiter Module. The combination of expert-based evaluation (heuristics) and user-based evaluation (guerrilla testing) ensures both theoretical soundness and real-world usability.

The system is well-designed for its purpose: helping recruitment teams make fair, documented, efficient hiring decisions. Continued focus on accessibility and first-time user experience will make it even stronger.

---

**Prashant Bhandari — ICT Project 2026 — LAB University of Applied Sciences**
