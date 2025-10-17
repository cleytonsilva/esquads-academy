# API Reference (Esquads Academy)

Base URL: `http://localhost:3001`

## Auth
- POST `/api/auth/register` — Create account.
  - Body: `{ email, password, role? }`
  - 201: `{ success, user }`
- POST `/api/auth/login` — Sign in.
  - Body: `{ email, password }`
  - 200: `{ success, session, user }`
- POST `/api/auth/logout` — Stateless logout (client discards tokens).
- GET `/api/auth/me` — Current user from Bearer token.
  - Header: `Authorization: Bearer <access_token>`
  - 200: `{ success, user }`

## Profile
- GET `/api/profile/me` — Get or auto-create user profile.
  - 200: `{ success, profile }`
- PUT `/api/profile/me` — Update selected fields.
  - Body: `{ interests?, skill_level?, learning_goals?, preferred_duration?, favorite_categories?, learning_style?, time_availability? }`
  - 200: `{ success, profile }`

## Certificates
- GET `/api/certificates/verify/:hash` — Verify certificate hash.
  - 200: `{ success, certificate }`

## Gamification
- GET `/api/gamification/leaderboard` — Top users by `total_points`.
  - 200: `{ success, leaderboard }`

## Uploads
- POST `/api/uploads` — Multipart upload of image/video (`file` field)
  - 200: `{ success, url }`

## Courses (admin)
- GET `/api/courses?status=published` — List courses
- GET `/api/courses/:id` — Course with modules and lessons
- POST `/api/courses` — Create course (admin)
- POST `/api/courses/:id/modules` — Add module (admin)
- POST `/api/modules/:moduleId/lessons` — Add lesson (admin)

Note: Creating a course without `thumbnail_url` triggers a Supabase Edge Function `generate_course_cover` (Replicate) to generate a cover image. Store `REPLICATE_API_TOKEN` in Supabase secrets.

## Analytics
- GET `/api/analytics/platform` — Basic platform metrics.
  - 200: `{ success, metrics }`

Notes
- Auth tokens: use Supabase access token in the `Authorization` header.
- Server uses Supabase Service Role for DB and anon key for sign-in/up.
