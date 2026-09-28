---
tags: [component, client, analytics]
---

# Site Analytics

Vercel Web Analytics for the whole site, plus the state-level visitor record it doesn't collect on its own. Web Analytics' pageview data stops at **country**; this adds one custom event per visit that carries the visitor's state/region and city, and keeps the site owner's own browsers out of the numbers.

## `components/SiteAnalytics.tsx`

`"use client"`. Mounted once in the root `app/layout.tsx` in place of a bare `<Analytics />` (a Server Component can't pass the `beforeSend` function prop, hence the client wrapper). Renders `<Analytics beforeSend={beforeSend} />` from `@vercel/analytics/next`, and on mount:

1. **Opt-out toggle.** `?analytics=off` on any page sets `localStorage["va-disable"] = "true"`; `?analytics=on` removes it. The console equivalent is `localStorage.setItem("va-disable", "true")`. It's per browser, so it has to be done once on each device.
2. **`beforeSend`** returns `null` (drops the event) whenever `va-disable` is set. It runs on every pageview and custom event, so an opted-out browser sends nothing at all.
3. **Visit event.** Unless opted out, once per tab session (`sessionStorage["va-visit-sent"]`) it fetches `/api/geo` and calls `track("Visit", { region, city })`. `region` is the ISO 3166-2 code, `"US-PA"` (or just the country code when Vercel has no region); `city` is the city name or `"Unknown"`. If `/api/geo` returns no country (always the case in local dev), no event is sent.

Two properties is the Pro-plan limit per custom event (Web Analytics Plus raises it to 8); country is already a built-in Web Analytics dimension, which is why `region` carries the country prefix instead of a third property.

The geo lookup usually finishes before `<Analytics>` has created `window.va`, and `track()` silently drops events until it exists. The component therefore creates the same queue Vercel's HTML snippet uses (`window.va ??= … window.vaq.push(…)`), and the script replays it when it loads.

## `app/api/geo/route.ts`

`GET` → JSON `{ country, region, city }`, read from the `x-vercel-ip-country`, `x-vercel-ip-country-region`, and `x-vercel-ip-city` headers Vercel's edge adds from the visitor's IP (the city is URL-decoded). `dynamic = "force-dynamic"`, `Cache-Control: no-store`. It stores nothing; locally the headers are absent and every field is `null`.

## Reading the data

In the Vercel dashboard: project → **Analytics** → **Events** panel → **Visit**, then break it down by `region` or `city`. The same numbers come from the Web Analytics API (`/v1/query/web-analytics/events/aggregate` with `by=eventData/region` and `filter=eventName eq 'Visit'`). Counts are sessions, with unique visitors alongside. Retention is the Pro reporting window, 12 months.

## Related
- [[Routes Overview]]
- [[Architecture and Data Flow]]
- [[Build Tooling and Config]]
- [[Home]]
