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

Architecture & Refactor Summary

This project refactors a tutorial-style Angular 17 CRUD application into a more production-oriented frontend architecture focused on API resilience, loading consistency, and clear separation of responsibilities.

The application now uses an interceptor-based request pipeline, typed API services, and Angular signals to create predictable UI behavior during API interactions.

⸻

Request architecture

All HTTP requests follow a consistent lifecycle:

Component → PostService → HttpClient → Interceptors → API
Component ← PostService ← HttpClient ← Interceptors ← API

This structure ensures loading state, retry behavior, and error handling are centralized and consistent across the application.

⸻

Responsibility separation

The refactor introduced clear boundaries between layers.

Components
	•	Manage reactive forms
	•	Control local UI state
	•	Display validation errors
	•	Handle navigation and retry UI

PostService
	•	Performs API communication
	•	Returns typed observables
	•	Does not handle loading or error logic

Loading interceptor
	•	Activates global loading state when a request begins
	•	Uses finalize() to stop loading when the request completes
	•	Supports concurrent requests safely

Error interceptor
	•	Retries transient failures for GET requests
	•	Applies backoff between retry attempts
	•	Classifies HTTP errors
	•	Displays toast notifications
	•	Rethrows errors to components

GlobalLoadingService
	•	Tracks active requests using Angular signals
	•	Prevents loading indicators from stopping prematurely

Signals
	•	Used for component-level state such as post lists, loading flags, and error state

⸻

Loading architecture

A global loading system was introduced using a loading interceptor and a signal-based request counter.

When a request starts:
loadingService.show()

When the request completes:
finalize() → loadingService.hide()

This guarantees loading state always resets, even when errors occur.

⸻

Error handling architecture

Service-level error handling was removed and replaced with a centralized error interceptor.

The interceptor now:
	•	retries network failures and 5xx responses
	•	limits retries to GET requests
	•	applies linear backoff
	•	displays user-friendly error messages
	•	rethrows errors to components

Validation errors (400 and 422) are handled locally by components so reactive forms can display feedback correctly.

⸻

API service refactor

PostService was simplified into a thin API layer.

Changes include:
	•	typed API responses
	•	removal of catchError from services
	•	removal of manual JSON serialization
	•	consistent API method signatures

This ensures interceptors manage infrastructure concerns while services remain predictable.

⸻

Component improvements

Create, Edit, and Index components were updated to:
	•	use Angular signals for UI state
	•	handle validation errors locally
	•	display loading indicators correctly
	•	prevent duplicate submissions
	•	support retry UI when API calls fail

⸻

Result

The application now demonstrates a production-style Angular frontend request architecture rather than a basic CRUD tutorial implementation.

The refactor improves:
	•	API reliability
	•	UI consistency during failures
	•	maintainability of components
	•	clarity of responsibility boundaries
	•	resilience of HTTP requests


	sequenceDiagram
  autonumber
  actor User
  participant Router
  participant AuthGuard
  participant LoginComponent
  participant AuthService
  participant TokenStorage as TokenStorageService
  participant PostPage as Post Component (Index/Create/Edit/View)
  participant PostService
  participant Http as HttpClient
  participant AuthInt as AuthInterceptor
  participant LoadInt as LoadingInterceptor
  participant ErrInt as ErrorInterceptor
  participant API as API Server

  User->>Router: Navigate to /post/index
  Router->>AuthGuard: canActivate?
  AuthGuard->>TokenStorage: getToken()

  alt No token found
    TokenStorage-->>AuthGuard: null
    AuthGuard-->>Router: redirect /auth/login
    Router-->>User: Show Login page

    User->>LoginComponent: Enter email + password, click Submit
    LoginComponent->>AuthService: login(credentials)
    AuthService-->>LoginComponent: LoginResponse (mock or real)

    LoginComponent->>AuthService: handleLoginSuccess(response)
    AuthService->>TokenStorage: setToken(token)
    AuthService->>TokenStorage: setRole(role)
    AuthService-->>LoginComponent: isAuthenticated = true
    LoginComponent->>Router: navigate to /post/index
  else Token exists
    TokenStorage-->>AuthGuard: token
    AuthGuard-->>Router: allow navigation
  end

  Router-->>PostPage: Render Post page
  PostPage->>PostService: getAll()/find()/create()/update()/delete()
  PostService->>Http: HTTP request

  Http->>AuthInt: Intercept request
  AuthInt->>TokenStorage: getToken()
  AuthInt-->>Http: Add Authorization header

  Http->>LoadInt: Intercept request
  LoadInt-->>Http: loadingService.show()

  Http->>ErrInt: Intercept request
  ErrInt-->>API: Send request

  alt Success response
    API-->>ErrInt: 200 OK + data
    ErrInt-->>LoadInt: pass through
    LoadInt-->>Http: finalize() -> loadingService.hide()
    Http-->>PostService: return data
    PostService-->>PostPage: observable next()
  else Error response
    API-->>ErrInt: 4xx/5xx error
    ErrInt-->>ErrInt: retry GET on 0/5xx (backoff)
    ErrInt-->>PostPage: toast.showError() (except 400/422)
    ErrInt-->>LoadInt: rethrow error
    LoadInt-->>Http: finalize() -> loadingService.hide()
    Http-->>PostService: error
    PostService-->>PostPage: observable error()
  end


Refactor Summary

Authentication & Routing
	•	Added AuthGuard to protect feature routes and redirect unauthenticated users to /auth/login.
	•	Implemented returnUrl handling so users are redirected back to the originally requested route after login.
	•	Added a wildcard 404 route to handle unknown URLs gracefully.
	•	Introduced a header layout showing login/logout state and current role.

HTTP Interceptors & Global UX
	•	Implemented a GlobalLoadingService (signal/computed) to track active HTTP requests and expose a single isLoading() signal.
	•	Added a Loading Interceptor that increments/decrements active request count using finalize() so loading state clears on success, error, or cancellation.
	•	Added an Error Interceptor with:
	•	Retry policy for GET requests only on network/5xx failures using backoff (timer(1000 * retryCount)).
	•	Centralized mapping of key HTTP statuses (0, 401, 403, 404, 500) to user-friendly messages.
	•	Explicit rethrow for validation errors (400/422) so components can handle form-specific feedback locally.

API Layer & DTO Contract
	•	Refactored PostService to use typed endpoints (Observable<Post>, Observable<Post[]>, etc.).
	•	Introduced DTOs (CreatePostDto, UpdatePostDto) to enforce the API contract and prevent accidental/unsafe payload submission (e.g., extra fields).
	•	Updated create/edit flows to perform explicit DTO mapping before calling the service.

Local Component State & Reliability
	•	Added local UI state using signals:
	•	isSubmitting to prevent double-submit.
	•	hasError to show retry UI states where appropriate (e.g., View/Edit fetch failures).
	•	serverErrorMessage for inline form feedback on validation failures.
	•	Ensured forms use markAllAsTouched() for predictable validation UX and markAsPristine() after loading existing data so dirty-checking is accurate.

Smart vs Presentational Components
	•	Refactored UI into reusable presentational components:
	•	PostFormComponent handles rendering + validation messages and emits submitForm.
	•	PostListTableComponent displays posts and emits deletePost.
	•	PostDetailsCardComponent displays a post and emits back.
	•	Smart pages (Create/Edit/Index/View) now own:
	•	business logic
	•	service calls
	•	navigation
	•	local state management
	•	error-state UI transitions

UX Improvements
	•	Added user feedback via ToastService for success/errors.
	•	Improved loading UX by disabling inputs while submitting and showing clear button label states (e.g., “Saving…”).
	•	Added retry patterns for failed fetches (View/Edit) without duplicating global toast logic.