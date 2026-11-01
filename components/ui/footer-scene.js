import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export const initFooter3D = (canvas, onReady) => {
  const mobile = matchMedia('(max-width: 639px)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile });
  const frame = canvas.parentElement;
  const palette = getComputedStyle(canvas.closest('.footer-night'));
  const color = token => palette.getPropertyValue(token).trim();
  const navy = color('--about-ink'), amber = color('--about-amber'), cream = color('--cream');
  renderer.setClearColor(navy, 0);
  renderer.setSize(frame.clientWidth, frame.clientHeight, false);
  renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  
  // Set camera to frame the character sitting at the desk from a side angle
  const camera = new THREE.PerspectiveCamera(35, frame.clientWidth / frame.clientHeight, 0.1, 1000);
  camera.position.set(-18, 12, 14); // Positioned to the left side (looking at character facing right)
  camera.lookAt(0, 8, 0); // Looking at the character's face/chest level

  // Lighting
  const ambient = new THREE.AmbientLight(color('--about-skin'), .7);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(amber, 2.1);
  keyLight.position.set(-10, 18, 10);
  keyLight.castShadow = !mobile;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -14; keyLight.shadow.camera.right = 14;
  keyLight.shadow.camera.top = 18; keyLight.shadow.camera.bottom = -14;
  keyLight.shadow.normalBias = .03; keyLight.shadow.radius = 4;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(color('--about-skin'), 1.7);
  fillLight.position.set(-6, 9, 12);
  scene.add(fillLight);

  // Draw each monitor texture once. Blinking swaps the cached cursor variant.
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 256; screenCanvas.height = 160;
  const screenContext = screenCanvas.getContext('2d');
  screenContext.fillStyle = navy; screenContext.fillRect(0, 0, 256, 160);
  [164, 116, 188, 142, 98, 174, 130, 194, 108].forEach((width, i) => {
    screenContext.fillStyle = i % 3 === 0 ? amber : cream;
    screenContext.globalAlpha = i % 3 === 0 ? .85 : .65;
    screenContext.fillRect(i % 2 ? 30 : 18, 16 + i * 13, width, 3);
  });
  screenContext.globalAlpha = 1;
  const cursorCanvas = document.createElement('canvas');
  cursorCanvas.width = 256; cursorCanvas.height = 160;
  const cursorContext = cursorCanvas.getContext('2d');
  cursorContext.drawImage(screenCanvas, 0, 0);
  cursorContext.fillStyle = amber; cursorContext.fillRect(18, 139, 8, 10);
  const screenTextures = [screenCanvas, cursorCanvas].map(source => {
    const texture = new THREE.CanvasTexture(source);
    texture.colorSpace = THREE.SRGBColorSpace; texture.flipY = false;
    return texture;
  });
  const screenMaterials = [];
  const ownedMaterials = new Set(), ownedTextures = new Set(screenTextures), ownedGeometries = new Set();
  let mixer, model, disposed = false, monitorLevel = 0, lastCursor = -1;
  const modelBox = new THREE.Box3();
  const viewDirection = new THREE.Vector3(-18, 4, 14).normalize();
  const fitCamera = () => {
    if (!model) return;
    model.updateMatrixWorld(true);
    modelBox.setFromObject(model);
    const center = modelBox.getCenter(new THREE.Vector3());
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const tanV = Math.tan(halfFov), tanH = tanV * camera.aspect;
    const right = new THREE.Vector3().crossVectors(camera.up, viewDirection).normalize();
    const up = new THREE.Vector3().crossVectors(viewDirection, right).normalize();
    // Fit the projected box rather than its oversized enclosing sphere.
    let distance = 0;
    for (const x of [modelBox.min.x, modelBox.max.x]) {
      for (const y of [modelBox.min.y, modelBox.max.y]) {
        for (const z of [modelBox.min.z, modelBox.max.z]) {
          const corner = new THREE.Vector3(x, y, z).sub(center);
          const depth = corner.dot(viewDirection);
          distance = Math.max(distance, depth + Math.abs(corner.dot(right)) / tanH, depth + Math.abs(corner.dot(up)) / tanV);
        }
      }
    }
    camera.position.copy(center).addScaledVector(viewDirection, distance * (mobile ? 1 : .55));
    camera.lookAt(center);
    // Lower the composition in the transparent canvas to overlap the name.
    camera.setViewOffset(frame.clientWidth, frame.clientHeight, 0, mobile ? 0 : -frame.clientHeight * .05, frame.clientWidth, frame.clientHeight);
    keyLight.target.position.copy(center); scene.add(keyLight.target);
  };
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);

  const releaseModel = loaded => {
    const textures = new Set(), materials = new Set(), geometries = new Set();
    loaded.traverse(node => {
      if (node.geometry) geometries.add(node.geometry);
      if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => {
        materials.add(material); Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
      });
      node.skeleton?.dispose();
    });
    geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose());
  };
  loader.load('/models/character.glb', (gltf) => {
    if (disposed) { releaseModel(gltf.scene); return; }
    model = gltf.scene;
    
    model.traverse((node) => {
      if (node.isMesh) {
        node.visible = true;
        ownedGeometries.add(node.geometry);
        (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => {
          ownedMaterials.add(material); Object.values(material).forEach(value => { if (value?.isTexture) ownedTextures.add(value); });
        });
        node.castShadow = !mobile; node.receiveShadow = !mobile;
        node.geometry.computeBoundingBox();
        const extent = node.geometry.boundingBox.getSize(new THREE.Vector3());
        const dimensions = [extent.x, extent.y, extent.z].sort((a, b) => a - b);
        const thin = dimensions[0] < dimensions[2] * .12;
        const recolor = original => {
          if (!original.color || original.map || original.lightMap) return original;
          const material = original.clone(); ownedMaterials.add(material);
          const name = `${node.name} ${original.name}`.toLowerCase();
          const blueScreen = thin && original.color.b > original.color.r * 1.8 && original.color.b > original.color.g * 1.2;
          if ((/screen|display/.test(name) || blueScreen) && material.emissive) {
            material.color.set(cream); material.map = screenTextures[0];
            material.emissive.set(cream); material.emissiveMap = screenTextures[0]; material.emissiveIntensity = 0;
            material.roughness = .6; screenMaterials.push(material);
          } else if (/hoodie|shirt|sweater|cube[._]?006/.test(name)) material.color.set(color('--inner'));
          else if (/trouser|pants|jeans/.test(name)) material.color.set(color('--about-navy'));
          else if (/(^|[^a-z])(cap|hat)([^a-z]|$)/.test(name)) material.color.set(cream);
          else if (/desktop|tabletop|desk.*top|table.*top/.test(name)) material.color.set(cream);
          else if (/chair|seat/.test(name)) material.color.set(amber);
          return material;
        };
        node.material = Array.isArray(node.material) ? node.material.map(recolor) : recolor(node.material);
      }
    });

    // Lower the model slightly if needed so desk sits correctly
    model.position.y = -1;
    // Rotate model to match the exact angle requested (facing slightly left from our view)
    model.rotation.y = -1.65; 
    
    scene.add(model);
    fitCamera();

    // Play typing animation
    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(model);
      // Explicitly find 'typing'
      const anim = gltf.animations.find(c => c.name === 'typing') || gltf.animations[0];
      if (anim) {
        const action = mixer.clipAction(anim);
        action.play();
      }
    }
    renderer.render(scene, camera);
    canvas.dataset.ready = 'true';
    onReady?.();
  });

  const clock = new THREE.Clock();
  
  // IntersectionObserver owns visibility. No per-frame layout polling while
  // the user is in the scroll story, including on a reverse visit.
  let footerVisible = false, footerFrame = 0;
  const animate = () => {
    footerFrame = 0;
    if (!footerVisible || document.hidden) return;
    const delta = Math.min(clock.getDelta(), .05);
    if (mixer) mixer.update(delta);
    const monitorOn = canvas.dataset.monitor === 'on';
    monitorLevel = canvas.dataset.reducedMotion === 'true' ? (monitorOn ? 1 : 0) : Math.min(monitorOn ? 1 : 0, monitorLevel + delta * 1.5);
    screenMaterials.forEach(material => { material.emissiveIntensity = monitorLevel * .6; });
    const cursor = canvas.dataset.reducedMotion === 'true' ? 1 : Math.floor(performance.now() / 900) % 2;
    if (cursor !== lastCursor) {
      lastCursor = cursor;
      screenMaterials.forEach(material => { material.map = screenTextures[cursor]; material.emissiveMap = screenTextures[cursor]; });
    }
    renderer.render(scene, camera);
    footerFrame = requestAnimationFrame(animate);
  };
  const syncFooter = () => {
    cancelAnimationFrame(footerFrame); footerFrame = 0;
    if (footerVisible && !document.hidden) { clock.getDelta(); animate(); }
  };
  const visibility = new IntersectionObserver(([entry]) => { footerVisible = entry.isIntersecting; syncFooter(); });
  visibility.observe(canvas);
  document.addEventListener('visibilitychange', syncFooter);
  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(footerFrame); visibility.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', syncFooter);
    mixer?.stopAllAction(); if (model) mixer?.uncacheRoot(model);
    renderer.dispose(); draco.dispose();
    model?.traverse(node => node.skeleton?.dispose());
    ownedGeometries.forEach(geometry => geometry.dispose());
    ownedMaterials.forEach(material => material.dispose()); ownedTextures.forEach(texture => texture.dispose());
  };

  // Handle Resize
  const resizeObserver = new ResizeObserver(() => {
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    if (!w || !h) return;
    const phone = matchMedia('(max-width: 639px)').matches;
    renderer.setPixelRatio(phone ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = !phone; keyLight.castShadow = !phone;
    model?.traverse(node => { if (node.isMesh) { node.castShadow = !phone; node.receiveShadow = !phone; } });
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitCamera();
  });
  resizeObserver.observe(frame);
  return dispose;
};
