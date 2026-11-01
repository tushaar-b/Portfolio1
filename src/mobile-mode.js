// Set by index.html before styles load; keep CSS and animation decisions aligned.
export const mobileMode = window.__MOBILE__ === true;
export const liteMode = mobileMode || new URLSearchParams(location.search).get('lite') === '1';
