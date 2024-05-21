import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'dat.gui';

// Global variables
let currentRef = null;
let renderer, camera, scene, orbitControls, gui;

// Initialize and mount the scene
export const initScene = (mountRef) => {
  currentRef = mountRef.current;

  // Scene, camera, renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(25, currentRef.clientWidth / currentRef.clientHeight, 0.1, 100);
  scene.add(camera);
  camera.position.set(5, 5, 5);
  camera.lookAt(new THREE.Vector3());

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  currentRef.appendChild(renderer.domElement);

  // OrbitControls
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;

  // Resize canvas
  const resize = () => {
    if (currentRef) {
      const width = currentRef.clientWidth;
      const height = currentRef.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };
  window.addEventListener("resize", resize);

  // Cube
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // GUI Controls
  if (!gui) {
    gui = new GUI();
  }

  gui.add(cube.position, 'x')
    .min(-10)
    .max(10)
    .step(0.5)
    .name('Pos X');
  gui.add(cube.position, 'y')
    .min(-10)
    .max(10)
    .step(0.5)
    .name('Pos Y');
  gui.add(cube.position, 'z')
    .min(-10)
    .max(10)
    .step(0.5)
    .name('Pos Z');

  // Animate the scene
  const animate = () => {
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene, camera);
  };
  animate();

  // Store the resize function to remove it later
  currentRef.resize = resize;
};

// Dismount and clean up the buffer from the scene
export const cleanUpScene = () => {
  currentRef?.removeChild(renderer.domElement);
  window.removeEventListener("resize", currentRef?.resize);

  scene.traverse((object) => {
    object.geometry?.dispose();
    (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material?.dispose());
  });

  renderer.dispose();
  gui?.destroy();
  gui = null;
};

