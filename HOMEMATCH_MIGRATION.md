# HomeMatch tenant app migration

This branch is an **initial tenant catalogue conversion**, not a production-ready release.

## Implemented
- App display name, slug, URL scheme and branding changed to HomeMatch.
- Search and Explore use the HomeMatch Express API (not Sanity search).
- Text, location, property type, minimum bedrooms and annual rent search.
- Paginated listings and native property detail screen.
- Naira/year displayed consistently; Applications tab no longer pretends to track Roam trips.
- Shared read-only property API types in `src/lib/homematch-api.ts`.

## Required local configuration
Copy into the local Expo environment (never commit secrets):

```env
EXPO_PUBLIC_API_BASE_URL=https://YOUR-HOMEMATCH-API/properties-base
```

**Important:** Set the value to the API origin/root that exposes `/properties` directly; do not include `/properties` in the variable. Example: `https://api.example.com` if `GET https://api.example.com/properties` is valid.

## Blocking work before release
- Replace Clerk auth/onboarding/account with the same Better Auth identity as the web app.
- Remove unused Sanity, Roam AI, short-stay booking and policy flows after the identity migration.
- Implement authenticated tenant favourites, inspection requests, application submission and tracking, notifications, payments and lease history using secured endpoints.
- Replace the inherited Roam icons, splash artwork, and other static visual assets with approved HomeMatch assets.
- Confirm web/mobile share the same backend URL, CORS/trusted origins, and environment configuration.
- Test builds, Android/iOS simulator flows, actual API responses and error states.
- Review the public property search and detail API privacy controls before deployment.

## Manual smoke test
1. Point `EXPO_PUBLIC_API_BASE_URL` at the feature-branch backend in a test environment.
2. `yarn install` and `yarn start`.
3. Sign in using the temporary existing auth while the auth migration is unfinished.
4. Explore/Search: confirm rental cards load and show annual rent.
5. Filter by city, type, minimum beds and rent; verify results and total pages.
6. Open a property, navigate back, test no-results and server-error states.
7. Verify that no landlord email, phone or identity data appears in responses.

Do **not** merge and deploy this as a complete tenant product until authentication and secured application endpoints have been implemented and tested.
