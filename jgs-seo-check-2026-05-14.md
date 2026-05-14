# JGS Limited — Post-Migration SEO Health Check
**Date:** 2026-05-14  
**Checked by:** Automated audit (Claude Code)

---

## ⛔ DEPLOYMENT — BLOCKED: Site returns 403 on all URLs

Both `https://jgslimited.co.uk/` and `https://www.jgslimited.co.uk/` return:

```
HTTP/2 403  x-deny-reason: host_not_allowed
```

This is a **GitHub Pages "custom domain not configured" error**, not a general server error. DNS has been cut over (confirmed below), but the GitHub Pages side is incomplete.

**DNS state:**
- Apex `jgslimited.co.uk` → `185.199.108-111.153` (GitHub Pages A records) ✓ DNS correct
- WWW `www.jgslimited.co.uk` CNAME → `innov8-workflows.github.io` ✗ **WRONG REPO**

The `innov8-workflows` GitHub Pages repo has its custom domain set to `innov8workflows.co.uk` (in the repo CNAME file). Requests for `www.jgslimited.co.uk` hit this repo and are rejected.

**Immediate actions needed (in order):**
1. In the JGS site's GitHub repo → Settings → Pages → Custom domain: enter `www.jgslimited.co.uk` (this writes the CNAME file and tells GitHub Pages to accept the host).
2. Fix the www DNS CNAME: `www.jgslimited.co.uk CNAME` should point to the JGS repo's `<user>.github.io` address — **not** `innov8-workflows.github.io`.
3. Confirm the apex A records (185.199.x.x) are in the JGS repo's Pages config too, or add a www → apex redirect.

Until this is fixed, Google will begin discovering 403s on its next crawl round. **Depending on when cutover happened, this may be 2–7 days away from triggering a mass de-index event.**

---

## 1. Indexation (from Google search results — GSC not connected)

Pages visible in Google index (pre-403 cache):

| URL | Indexed |
|-----|---------|
| `https://jgslimited.co.uk/` | ✅ Yes |
| `https://www.jgslimited.co.uk/block-paving/` | ✅ Yes |
| `https://www.jgslimited.co.uk/tarmac-drives/` | ✅ Yes |
| `https://www.jgslimited.co.uk/testimonials/` | ✅ Yes |
| `https://www.jgslimited.co.uk/drop-kerbs/` | ✅ Yes |
| `https://www.jgslimited.co.uk/patios/` | ✅ Yes |
| `/fencing-landscapes/` | ❌ Not found |
| `/drainage-work/` | ❌ Not found |
| `/contact/` | ❌ Not found |
| `/cookie-policy/` | ❌ Not found |
| `/case-studies/` | ❌ Not found |

The 5 missing pages were not returned by `site:` searches. Likely cause: they were crawled after the 403 started, or they weren't indexed on the old WordPress either (lower crawl priority). Once the 403 is resolved, submit a sitemap in GSC to force re-crawl.

---

## 2. Rankings (UK search, organic, 2026-05-14)

| Query | JGS Position |
|-------|-------------|
| Derbyshire driveway contractor | **#1** ✅ |
| driveway contractor Belper | **#1** ✅ |
| driveway contractor Ripley | **#1** ✅ |
| driveways Derbyshire | Not in top 10 ⚠️ |
| block paving Derbyshire | Not in top 10 ⚠️ |
| tarmac drives Derbyshire | Not in top 10 ⚠️ |

Exact-match brand-location phrases are holding #1. The broader commercial terms are not ranking — this is consistent with a post-migration drop (week 2). The 403 will accelerate that drop if not fixed within the next few days.

---

## 3. Old WordPress URLs

**Still indexed in Google:**
- `https://www.jgslimited.co.uk/2018/09/16/forecourt-resurfacing/` — still live in index
- `https://www.jgslimited.co.uk/2018/09/16/block-paving-driveway-in-kilburn/` — still live in index

`site:jgslimited.co.uk/2017/` returned no results — 2017 URLs appear clean.

**All 26 meta-refresh redirect URLs return 403** (tested: `/forecourt-resurfacing/`, `/private-road-repair/`, `/block-paving/` service page). Cannot confirm redirect HTML is functioning. Once the 403 is resolved, re-test these; if they serve correctly, the old WP URLs should drop out of the index within a few crawl cycles.

---

## 4. Coverage / PageSpeed

Cannot check — site is 403. Run PageSpeed Insights after the custom domain issue is fixed.

---

## 5. Schema

Cannot validate — site is 403. Rerun the Rich Results Test after deployment is confirmed.

---

## Summary

| Check | Status |
|-------|--------|
| Site live | ❌ 403 on all URLs |
| DNS cutover | ✅ Done (but misconfigured) |
| GitHub Pages custom domain | ❌ Not set — **fix this first** |
| WWW CNAME (DNS) | ❌ Points to wrong repo |
| Rankings (brand-local) | ✅ Holding #1 |
| Rankings (broad terms) | ⚠️ Not visible — expected at week 2 |
| Old WP URLs | ⚠️ Some still indexed, redirects untestable until 403 fixed |

**The migration is DNS-cut but not serving.** Fix the GitHub Pages custom domain config and the www CNAME before Google's next crawl discovers the 403 at scale.
