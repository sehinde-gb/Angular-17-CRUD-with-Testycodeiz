Angular 17 CRUD Refactor & Audit

Repository: https://github.com/sehinde-gb/Angular-17-CRUD-with-Testycodeiz
Angular: 17
Purpose: Architecture audit + refactor exercise

⸻

Project Overview

This project is a CRUD application built with Angular 17.
The goal of this fork is to audit, stabilise, and refactor the application toward enterprise-ready Angular patterns.

The refactor focuses on:
	•	Feature-based architecture
	•	Routing correctness
	•	UI state handling (loading / error)
	•	API resilience
	•	Guard-based navigation safety
	•	Component responsibility separation

⸻

Issues Identified During Audit

Navigation & Routing

Observed issues:
	•	/post/index renders the listing underneath the home page
	•	Back navigation from post detail returns to home instead of post list
	•	Direct routes like /post/1 redirect incorrectly
	•	Router layout behaviour is inconsistent

Impact:
	•	Loss of user context
	•	Confusing navigation flow
	•	Broken deep linking

⸻

CRUD Behaviour

Edit page changes were not persisted to the backend.

Impact:
	•	CRUD reliability issue
	•	Loss of user trust
	•	Potential data inconsistency

⸻

Project Structure

Original structure mixed responsibilities and naming conventions.

Example:

src/app/post/index/index.component.ts

src/app/features/posts/
  pages/
    post-list/
    post-create/
    post-edit/
    post-detail/
  components/
    post-form/
    post-table/
  services/
    posts.service.ts
  models/
    post.model.ts

Reasoning:
	•	Pages = route containers
	•	Components = reusable UI
	•	Services = API + domain logic
	•	Models = domain types

⸻

Component Responsibility Improvements

Smart vs Presentational Components

Planned separation:

Smart (pages):
	•	Load data
	•	Handle workflow
	•	Manage UI state

Presentational (components):
	•	Display data
	•	Emit events
	•	No business logic

⸻

State & UI Behaviour Improvements

Original project lacked:
	•	Loading states
	•	API error states
	•	Consistent UI feedback

Added pattern:
	•	isLoading
	•	errorMessage
	•	successMessage

Goal:
Predictable UI behaviour during API calls.

⸻

API & Integration Improvements

Original gaps:
	•	No timeout strategy
	•	No retry handling
	•	No interceptor-based error handling

Refactor introduces:
	•	HTTP error interceptor
	•	Network failure handling
	•	Consistent API error strategy

Layered handling:
	•	Interceptor → cross-cutting HTTP errors
	•	Service → domain-level fallback behaviour

⸻

Security & Navigation Safety

Original project:
	•	No route guards
	•	No protection against unsaved edits

Refactor adds:
	•	Route guard for protected routes
	•	Unsaved changes guard (planned)

Goal:
Prevent accidental navigation loss and unauthorised access.

⸻

Testing Observations

Current state:
	•	Unit tests present
	•	No E2E coverage

Planned improvement:
	•	Cypress smoke tests for core CRUD flows

⸻

Top Risks Identified
	1.	Routing/layout behaviour
	2.	Edit persistence failure
	3.	Missing loading/error states
	4.	Lack of API resilience strategy
	5.	Inconsistent project structure

⸻

Refactor Roadmap

Phase 1
	•	Fix routing layout
	•	Fix edit persistence
	•	Add loading/error UI states

Phase 2
	•	Add interceptors for API errors
	•	Add navigation guards

Phase 3
	•	Finalise feature-based structure
	•	Separate smart vs presentational components
	•	Add Cypress smoke tests

⸻

Running the Project

npm install
ng serve 

http://localhost:4200