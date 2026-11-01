const scenes = new Map();
export function sceneReady(name) {
  const scene = scenes.get(name);
  if (scene) scene.resolve();
  else scenes.set(name, { promise: Promise.resolve(), resolve() {} });
}
function waitForScene(name) {
  if (!scenes.has(name)) {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    scenes.set(name, { promise, resolve });
  }
  return scenes.get(name).promise;
}
export function scrollScenesReady() {
  const names = [];
  if (document.getElementById('character-root')) names.push('hero');
  if (document.getElementById('journey-root')) names.push('ride');
  if (document.getElementById('good-design-root')) names.push('focus');
  return Promise.all([document.fonts.ready, ...names.map(waitForScene)]);
}
