import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Scene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            currentMount.clientWidth / currentMount.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 4.5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Loader
        const gltfLoader = new GLTFLoader()
        gltfLoader.load('./model/portfolioObject.gltf',
            (gltf) => {
                scene.add(gltf.scene)
            },
            () => {
                
            },
            () => {
                
            }      
        )
        // Textures
        const textureLoader = new THREE.TextureLoader();
        const map = textureLoader.load('/textures/bricks/basecolor.jpg');
        const aoMap = textureLoader.load('/textures/bricks/ao.jpg');
        const roughnessMap = textureLoader.load('/textures/bricks/roughness.jpg');
        const normalMap = textureLoader.load('/textures/bricks/normal.jpg');
        const heightMap = textureLoader.load('/textures/bricks/height.png');

        // Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.3);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Render the scene
        const animate = () => {
            controls.update();
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Clean up scene
        return () => {
            currentMount.removeChild(renderer.domElement);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div 
            className="Contenedor3D"
            ref={mountRef}
            style={{ width: '100%', height: '100vh' }}
        ></div>
    );
};

export default Scene;
