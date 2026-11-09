# HomeMatch tenant app migration (work in progress)

This branch begins converting the Expo/React Native Roam prototype into HomeMatch.

## Implemented in this branch
- HomeMatch display name, slug, URL scheme and wordmark
- Rental home discovery replacing Sanity-driven home recommendations
- Search by keyword, location, property type, annual rent and minimum bedrooms
- Paginated search using the same Express `GET /properties` endpoint as the web frontend
- Public rental details with photographs and naira-per-year pricing
- Applications tab renamed and accurately marked as pending integration

## Configure the backend
Set `EXPO_PUBLIC_HOMEMATCH_API_URL` to the Express API origin, **without** `/properties`, such as `https://your-api.example`. This is not a secret. A physical phone must be able to reach it; `localhost` on a phone will not reach your computer.

The backend search changes are proposed in the matching `homematch-main` pull request. Merge and deploy that API before testing the new mobile filters.

## NOT complete — do not deploy this as a finished tenant app
- The root navigator, onboarding, profile, and existing legacy stay routes **still use Clerk**. They must migrate together to Better Auth / Expo before authenticated HomeMatch tenant operations are enabled.
- Legacy Sanity and Roam dependencies, screens, policies and analytics have not all been removed.
- Saved homes, applications, inspection requests, payments, tenant dashboard, and leases are **not connected**. Existing legacy routes are not a valid replacement.
- Existing property photos and app icon/splash assets must be reviewed and replaced with approved HomeMatch branding.
- Test on iOS and Android, check API CORS and session/deep-link behaviour, and run Expo lint and typecheck before release.

No real payment or rental application button is enabled by this branch. The property-details screen clearly explains the pending integration.

## Integration sequence
1. Merge and deploy API search/security changes.
2. Migrate Better Auth server + Expo auth client; remove Clerk from all route guards and screens in one coordinated change.
3. Implement tenant-owned favourites and applications in the backend, then wire mobile screens.
4. Integrate inspections and verified payments only after server-side ownership and payment amount checks are addressed.
5. Remove remaining Roam assets, Sanity code and legacy stay routes after route navigation is migrated.
