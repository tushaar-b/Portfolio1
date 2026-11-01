const origin = 'https://tushaarbportfolio.vercel.app';
const titles = ['Multi-Terrain Disaster-Rescue Rover', 'CAE Laminate Solver', 'Mess Management System', 'Aarthi AI — Financial Planner & Stock Prediction Platform'];
export function setPageMetadata(projects = false) {
  const url = `${origin}${projects ? '/projects' : '/'}`;
  const title = projects ? 'Projects | Tushaar Bharara — Web Development & AI' : 'Tushaar Bharara | Web Developer & AI Projects';
  const description = projects ? "Things I've Built: explore Tushaar Bharara's disaster-rescue rover, composite materials solver, mess management system and Aarthi AI financial planner." : "Explore Tushaar Bharara's portfolio: web development, AI and machine learning, and robotics projects. CSE (Data Science) student at VIT Vellore.";
  document.title = title;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  for (const [selector, value] of [
    ['meta[name="description"]', description], ['meta[property="og:title"]', title],
    ['meta[property="og:description"]', description], ['meta[property="og:url"]', url],
    ['meta[name="twitter:title"]', title], ['meta[name="twitter:description"]', description],
  ]) document.querySelector(selector)?.setAttribute('content', value);
  const author = { '@type': 'Person', '@id': `${origin}/#person`, name: 'Tushaar Bharara', url: `${origin}/`, jobTitle: 'Aspiring Web Developer', sameAs: ['https://www.linkedin.com/in/tushaarbharara', 'https://github.com/tushaar-b'] };
  const page = projects
    ? { '@type': 'CollectionPage', url, name: title, author: { '@id': author['@id'] }, mainEntity: { '@type': 'ItemList', itemListElement: titles.map((name, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'CreativeWork', name, author: { '@id': author['@id'] } } })) } }
    : { '@type': 'ProfilePage', url, name: title, mainEntity: { '@id': author['@id'] } };
  const schema = document.querySelector('script[type="application/ld+json"]');
  if (schema) schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [author, page] });
}
