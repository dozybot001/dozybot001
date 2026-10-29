// Builds the profile's images and refreshes the README. Runs daily in GitHub Actions;
// locally: GITHUB_TOKEN=$(gh auth token) node scripts/update.mjs
//   assets/banner-{light,dark}.svg    name card with a contribution-grid Tenon mark
//   assets/activity-{light,dark}.svg  last 12 months of contributions, streaks and stars
//   README.md "Writing" section       latest posts from the Tenon blog feed
import { readFile, writeFile } from 'node:fs/promises';

const LOGIN = 'dozybot001';
const FEED = 'https://tenon.asia/blog/feed.xml';
const root = new URL('../', import.meta.url);
const file = path => new URL(path, root);

const THEMES = {
  light: { bg: '#ffffff', edge: '#d0d7de', ink: '#181818', soft: '#52525b', muted: '#8a8a8f', accent: '#f06b32', accentText: '#b8430f', levels: ['#ebedf0', '#fcd9c4', '#f6a578', '#ef7a3e', '#c9501a'] },
  dark: { bg: '#0d1117', edge: '#30363d', ink: '#f2f2f2', soft: '#b1b1b8', muted: '#7d7d85', accent: '#ff8a50', accentText: '#ff8a50', levels: ['#161b22', '#4a2414', '#86391a', '#c9521f', '#ff8a50'] },
};
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif";
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const number = n => Number(n).toLocaleString('en-US');

// ---- Banner ------------------------------------------------------------------

// The Tenon mark (a tenon seen end-on: a T) drawn in a 12 × 7 contribution grid.
const MARK = new Set(['1,2', '1,3', '1,4', '1,5', '1,6', '1,7', '1,8', '1,9', '2,2', '2,3', '2,4', '2,5', '2,6', '2,7', '2,8', '2,9', '3,5', '3,6', '4,5', '4,6', '5,5', '5,6']);
function banner(theme, font) {
  const t = THEMES[theme];
  const cells = [];
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let row = 0; row < 7; row++) for (let col = 0; col < 12; col++) {
    const inMark = MARK.has(`${row},${col}`);
    const noise = random();
    // Static on purpose: some renderers freeze SVG animations on their first frame.
    const level = inMark ? (noise < 0.3 ? 3 : 4) : noise < 0.78 ? 0 : noise < 0.93 ? 1 : 2;
    cells.push(`<rect x="${852 + col * 30}" y="${58 + row * 30}" width="24" height="24" rx="5" fill="${t.levels[level]}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 320" role="img" aria-label="Dorian Zeng, AI Agent and Agent Platform Engineer, building 榫卯 Tenon AI">
<style>
@font-face { font-family: 'Manrope'; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 200 800; }
text { font-family: 'Manrope', ${SANS}; }
</style>
<rect x="1" y="1" width="1278" height="318" rx="20" fill="${t.bg}" stroke="${t.edge}" stroke-width="1.5"/>
<g transform="translate(72 62)"><rect width="34" height="34" rx="9" fill="#f06b32"/><path d="M7 8.5H27V14.9H20.2V25.5H13.8V14.9H7Z" fill="#fff"/></g>
<text x="118" y="86" font-size="18" font-weight="600" fill="${t.soft}">榫卯 Tenon AI</text>
<text x="72" y="172" font-size="66" font-weight="700" letter-spacing="-1.6" fill="${t.ink}">Dorian Zeng<tspan dx="22" font-size="30" font-weight="500" letter-spacing="0" fill="${t.muted}">曾德扬</tspan></text>
<text x="72" y="220" font-size="26" font-weight="600" fill="${t.soft}">AI Agent / Agent Platform Engineer</text>
<text x="72" y="262" font-size="19" font-weight="500" fill="${t.muted}">Operable, auditable and recoverable agent systems<tspan fill="${t.accentText}" dx="14">·</tspan><tspan dx="14">Singapore</tspan></text>
${cells.join('\n')}
</svg>
`;
}

// ---- Activity ----------------------------------------------------------------

async function github(query, variables) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is required');
  const response = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { authorization: 'bearer ' + token, 'content-type': 'application/json', 'user-agent': LOGIN + '-profile' }, body: JSON.stringify({ query, variables }) });
  const data = await response.json();
  if (!response.ok || data.errors) throw new Error('GitHub GraphQL: ' + JSON.stringify(data.errors || response.status));
  return data.data;
}

async function activityData() {
  const { user } = await github(`query($login: String!) { user(login: $login) {
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100) { totalCount nodes { stargazerCount } }
    contributionsCollection { totalCommitContributions
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`, { login: LOGIN });
  const days = user.contributionsCollection.contributionCalendar.weeks.flatMap(w => w.contributionDays);
  let longest = 0, run = 0;
  for (const day of days) { run = day.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
  // Today may still be empty; the streak is alive if yesterday counted.
  let current = 0, index = days.length - 1;
  if (!days[index].contributionCount) index--;
  while (index >= 0 && days[index].contributionCount) { current++; index--; }
  return {
    weeks: user.contributionsCollection.contributionCalendar.weeks,
    total: user.contributionsCollection.contributionCalendar.totalContributions,
    commits: user.contributionsCollection.totalCommitContributions,
    repos: user.repositories.totalCount,
    stars: user.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0),
    followers: user.followers.totalCount,
    current, longest,
    updated: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Singapore' }),
  };
}

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function activity(theme, data) {
  const t = THEMES[theme];
  const pitch = 14, size = 11, left = 52, top = 150;
  const stats = [
    [number(data.total), 'contributions in the last year'],
    [`${data.current} ${data.current === 1 ? 'day' : 'days'}`, 'current streak'],
    [`${data.longest} days`, 'longest streak'],
    [number(data.stars), `stars on ${data.repos} public repos`],
  ];
  const statBlocks = stats.map(([value, label], i) => `<text x="${32 + i * 196}" y="82" font-size="30" font-weight="700" letter-spacing="-0.6" fill="${i === 0 ? t.accentText : t.ink}">${escape(value)}</text><text x="${32 + i * 196}" y="106" font-size="13" fill="${t.muted}">${escape(label)}</text>`).join('\n');
  const cells = [], starts = [];
  data.weeks.forEach((week, w) => {
    week.contributionDays.forEach(day => {
      const weekday = new Date(day.date + 'T00:00:00Z').getUTCDay();
      cells.push(`<rect x="${left + w * pitch}" y="${top + weekday * pitch}" width="${size}" height="${size}" rx="2.5" fill="${t.levels[LEVEL[day.contributionLevel] ?? 0]}"/>`);
    });
    const month = new Date(week.contributionDays[0].date + 'T00:00:00Z').getUTCMonth();
    if (!starts.length || starts.at(-1).month !== month) starts.push({ month, w });
  });
  // Label a month only when it has room: at least three weeks before the next label.
  const labels = starts.filter((s, i) => (starts[i + 1]?.w ?? data.weeks.length) - s.w >= 3);
  const months = labels.map(s => `<text x="${left + s.w * pitch}" y="${top - 10}" font-size="11" fill="${t.muted}">${MONTHS[s.month]}</text>`);
  const width = left + data.weeks.length * pitch + 30, height = top + 7 * pitch + 46;
  const legendStart = width - 32 - 34 - 5 * 15;
  const legend = t.levels.map((c, i) => `<rect x="${legendStart + i * 15}" y="${height - 30}" width="${size}" height="${size}" rx="2.5" fill="${c}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(`${number(data.total)} GitHub contributions in the last year; current streak ${data.current} days; longest streak ${data.longest} days`)}">
<style>text { font-family: ${SANS}; }</style>
<rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14" fill="${t.bg}" stroke="${t.edge}" stroke-width="1.5"/>
<text x="32" y="40" font-size="14" font-weight="600" fill="${t.soft}">Last 12 months</text>
<text x="${width - 32}" y="40" font-size="12" text-anchor="end" fill="${t.muted}">updated ${data.updated}</text>
${statBlocks}
${months.join('')}
<text x="${left - 10}" y="${top + 1 * pitch + 9}" font-size="10" text-anchor="end" fill="${t.muted}">Mon</text>
<text x="${left - 10}" y="${top + 3 * pitch + 9}" font-size="10" text-anchor="end" fill="${t.muted}">Wed</text>
<text x="${left - 10}" y="${top + 5 * pitch + 9}" font-size="10" text-anchor="end" fill="${t.muted}">Fri</text>
${cells.join('')}
<text x="${legendStart - 6}" y="${height - 21}" font-size="11" text-anchor="end" fill="${t.muted}">Less</text>${legend}<text x="${width - 32}" y="${height - 21}" font-size="11" text-anchor="end" fill="${t.muted}">More</text>
<text x="32" y="${height - 21}" font-size="11" fill="${t.muted}">${number(data.commits)} commits · private contributions included</text>
</svg>
`;
}

// ---- Writing -----------------------------------------------------------------

async function writing(limit = 4) {
  const response = await fetch(FEED, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('feed HTTP ' + response.status);
  const xml = await response.text();
  const tag = (item, name) => (item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`)) || [])[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
  const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const items = (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map(item => ({ title: decode(tag(item, 'title')), link: tag(item, 'link'), date: new Date(tag(item, 'pubDate')) }))
    .filter(i => i.title && i.link && !isNaN(i.date)).sort((a, b) => b.date - a.date).slice(0, limit);
  if (!items.length) throw new Error('feed has no items');
  return items.map(i => `- [${i.title.replace(/[[\]]/g, '')}](${i.link}) <sub>${i.date.toISOString().slice(0, 10)}</sub>`).join('\n');
}

function replaceSection(readme, name, body) {
  const pattern = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!pattern.test(readme)) throw new Error(`README is missing the ${name} markers`);
  return readme.replace(pattern, `$1\n${body}\n$2`);
}

// ---- Main --------------------------------------------------------------------

const font = await readFile(file('assets/fonts/manrope-latin.woff2'), 'base64');
for (const theme of Object.keys(THEMES)) await writeFile(file(`assets/banner-${theme}.svg`), banner(theme, font));

const data = await activityData();
for (const theme of Object.keys(THEMES)) await writeFile(file(`assets/activity-${theme}.svg`), activity(theme, data));
console.log(`activity: ${data.total} contributions, streak ${data.current}/${data.longest}, ${data.stars} stars`);

// A feed outage keeps yesterday's list rather than failing the run.
let readme = await readFile(file('README.md'), 'utf8');
try { readme = replaceSection(readme, 'writing', await writing()); console.log('writing: refreshed'); }
catch (error) { console.log('writing: kept previous list (' + error.message + ')'); }
await writeFile(file('README.md'), readme);
