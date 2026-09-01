# Phase 1: Stabilisation

## Objective

Make the existing BuildWire prototype safe to operate with a small beta group
before adding new product features.

## Threat model

- A signed-in reader must only be able to change their own saved articles and
  followed topics.
- Admin access must require both the persisted admin role and a currently
  allowlisted email address.
- Untrusted form, query-string, and API input must not reach the database in an
  invalid or unsafe form.
- Imported records must reference real categories and public tracking must not
  expose internal errors.
- Account deletion must not report success if the Clerk identity could not be
  deleted.

## Implemented in this phase

- Scoped saved-article deletion to the authenticated user.
- Removed unpublished articles from saved-article dashboard results.
- Fixed RSS category lookup to query the categories table.
- Added shared slug, URL, region, and date validation helpers.
- Validated admin article, category, and material-anchor inputs.
- Demoted removed admin allowlist entries and require an active allowlist entry
  at every admin boundary.
- Require a verified primary email when creating an allowlisted admin.
- Made search end dates inclusive and ignored invalid date filters.
- Prevented the import endpoint from returning internal exception details.
- Made account deletion fail visibly when Clerk deletion fails.
- Added regression tests for shared validation behavior.

## Explicitly deferred

Distributed rate limiting, CAPTCHA/spam controls, newsletter delivery,
scheduled jobs, monitoring, and database backup configuration require a chosen
production provider and are Phase 2 infrastructure work.

## Verification checklist

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` before
deploying. Apply migrations with `npm run db:migrate`; never use reset seed or
schema push commands against production.
