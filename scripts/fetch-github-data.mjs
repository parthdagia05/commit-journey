#!/usr/bin/env node
/**
 * Builds data/github.json — the real numbers behind the page.
 *
 * The contribution calendar is only exposed over GraphQL, and the merged-PR
 * counts come from the REST search API. Both need a token; in CI that is
 * GH_PAT if present, otherwise the workflow's GITHUB_TOKEN.
 *
 * PR counts are pinned to is:public so every token agrees. The calendar total
 * is the one number that still moves with the token: the profile owner's own
 * token includes their private contributions, GITHUB_TOKEN does not. The
 * difference is small and the committed file is whatever CI last wrote.
 *
 *   GITHUB_TOKEN=$(gh auth token) node scripts/fetch-github-data.mjs
 */

const LOGIN = process.env.GH_LOGIN || 'parthdagia05';
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = new URL('../data/github.json', import.meta.url);

if (!TOKEN) {
  console.error('fetch-github-data: no GITHUB_TOKEN in env.');
  process.exit(1);
}

const HEADERS = {
  authorization: `bearer ${TOKEN}`,
  accept: 'application/vnd.github+json',
  'user-agent': `commit-journey/${LOGIN}`
};

async function graphql(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...HEADERS, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) throw new Error(`graphql ${res.status} ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`graphql: ${JSON.stringify(json.errors)}`);
  return json.data;
}

/* ---- contribution calendar -------------------------------------------
   Stored as a start date plus a flat run of daily counts. GitHub's weeks
   begin on Sunday, so index i is start + i days and the page can slice it
   into columns of 7 without carrying 371 date strings around. */
async function calendar() {
  const data = await graphql(`
    query($login:String!){
      user(login:$login){
        contributionsCollection{
          contributionCalendar{
            totalContributions
            weeks{ contributionDays{ date contributionCount } }
          }
        }
      }
    }`, { login: LOGIN });

  const weeks = data.user.contributionsCollection.contributionCalendar.weeks;
  const days = weeks.flatMap(w => w.contributionDays);
  const counts = days.map(d => d.contributionCount);
  return {
    start: days[0].date,
    end: days[days.length - 1].date,
    total: data.user.contributionsCollection.contributionCalendar.totalContributions,
    max: counts.reduce((a, b) => Math.max(a, b), 0),
    counts
  };
}

/* ---- merged pull requests --------------------------------------------
   Search caps a query at 1000 results across 10 pages of 100; well clear of
   where this sits, but the loop stops on a short page either way. */
async function mergedPRs() {
  const byRepo = {};
  let total = 0;

  for (let page = 1; page <= 10; page++) {
    // is:public keeps the result independent of whose token is running this.
    // A personal token also sees merged PRs in the user's own private repos,
    // so without it CI and a local run disagree, and the committed file
    // flip-flops. Public-only is also the number a visitor can verify.
    const q = encodeURIComponent(`is:pr author:${LOGIN} is:merged is:public`);
    const res = await fetch(
      `https://api.github.com/search/issues?q=${q}&per_page=100&page=${page}`,
      { headers: HEADERS }
    );
    if (!res.ok) throw new Error(`search ${res.status} ${await res.text()}`);
    const json = await res.json();
    if (page === 1) total = json.total_count;

    for (const item of json.items) {
      const repo = item.repository_url.replace('https://api.github.com/repos/', '');
      byRepo[repo] = (byRepo[repo] || 0) + 1;
    }
    if (json.items.length < 100) break;
    await new Promise(r => setTimeout(r, 1200)); // search API is rate-limited hard
  }

  // "Upstream" means a repo someone else owns. Merging into your own project
  // is real work, but it is not the number this page is claiming.
  const byOrg = {};
  let upstreamMerged = 0;
  const upstreamRepos = [];
  for (const [repo, n] of Object.entries(byRepo)) {
    const owner = repo.split('/')[0];
    if (owner.toLowerCase() === LOGIN.toLowerCase()) continue;
    byOrg[owner] = (byOrg[owner] || 0) + n;
    upstreamMerged += n;
    upstreamRepos.push(repo);
  }

  const sortDesc = (obj) => Object.fromEntries(
    Object.entries(obj).sort((a, b) => b[1] - a[1])
  );

  return {
    merged: total,
    upstreamMerged,
    upstreamRepos: upstreamRepos.length,
    upstreamOrgs: Object.keys(byOrg).length,
    byOrg: sortDesc(byOrg),
    byRepo: sortDesc(byRepo)
  };
}

const [cal, prs] = await Promise.all([calendar(), mergedPRs()]);
const payload = {
  generated: new Date().toISOString(),
  login: LOGIN,
  calendar: cal,
  prs
};

const { writeFileSync } = await import('node:fs');
writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');
console.log(
  `wrote data/github.json — ${prs.merged} merged PRs ` +
  `(${prs.upstreamMerged} upstream across ${prs.upstreamOrgs} orgs), ` +
  `${cal.total} contributions since ${cal.start}`
);
