import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Global variables
let currentRef = null;
let renderer, camera, scene, orbitControls;

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


  // Animate the scene
  const animate = () => {
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene, camera);
  };
  animate();

  // Load model 3d
  const gltfLoader = new GLTFLoader()
  gltfLoader.load('./model/scene/scene.gltf',
    (gltf) => {
      scene.add(gltf.scene)
    },
    () => {
      console.log('Progress')
    },
    () => {
      console.log('Error')
    }
  )

  // Light
  const light1 = new THREE.DirectionalLight(0xffffff, 4)
  light1.position.set(6,6,6)
  scene.add(light1)

  const al = new THREE.AmbientLight(0xffffff, 1)
  scene.add(al)

  const envMap = new THREE.CubeTextureLoader().load(
    [
      './envMap/px.png',
      './envMap/nx.png',
      './envMap/py.png',
      './envMap/ny.png',
      './envMap/pz.png',
      './envMap/nz.png',
    ]
  )
  scene.environment = envMap
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
};

