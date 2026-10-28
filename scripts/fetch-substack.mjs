// Fetches the UCI Solar Car Substack RSS and writes posts.json (latest posts).
// Run by the GitHub Action on a schedule; also runnable locally with `node scripts/fetch-substack.mjs`.
import { writeFileSync } from 'node:fs';

const FEED  = 'https://ucisolarcar.substack.com/feed';
const COUNT = 6;
const UA    = 'Mozilla/5.0 (compatible; UCISolarCarBot/1.0; +https://ucisolarcar.org)';

function tag(block, name){
  const m = block.match(new RegExp('<' + name + '>([\\s\\S]*?)</' + name + '>'));
  if(!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}
function decode(s){
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
          .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ');
}
function pickImage(block){
  // 1) first <img> inside the post content (most reliable, skips podcast audio)
  const content = tag(block, 'content:encoded');
  const im = content.match(/<img[^>]+src="([^"]+)"/i);
  if(im) return im[1];
  // 2) an enclosure that is actually an image
  for(const e of (block.match(/<enclosure[^>]*>/g) || [])){
    const u = e.match(/url="([^"]+)"/), t = e.match(/type="([^"]+)"/);
    if(u && (!t || /^image\//i.test(t[1]))) return u[1];
  }
  return '';
}

const res = await fetch(FEED, { headers: { 'User-Agent': UA, Accept: 'application/rss+xml,application/xml' } });
if(!res.ok) throw new Error('feed fetch failed: ' + res.status);
const xml = await res.text();

const items = xml.split('<item>').slice(1).map(s => s.split('</item>')[0]);
const posts = items.slice(0, COUNT).map(block => {
  let desc = decode(tag(block, 'description').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  if(desc.length > 140) desc = desc.slice(0, 140).replace(/\s+\S*$/, '') + '…';
  return {
    title: decode(tag(block, 'title')),
    link:  tag(block, 'link'),
    date:  tag(block, 'pubDate'),
    description: desc,
    image: pickImage(block)
  };
});

writeFileSync(new URL('../posts.json', import.meta.url), JSON.stringify({ updated: new Date().toISOString(), posts }, null, 2) + '\n');
console.log('wrote posts.json with ' + posts.length + ' post(s)');
