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
        camera.position.z = 5.5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Resize
        const resize = () => {
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
            camera.aspect = currentMount.clientWidth | currentMount.clientHeight
            camera.updateProjectionMatrix()
        }
        window.addEventListener('resize', resize)

        // Loader
        const textureLoader = new THREE.TextureLoader();
        const matcap =  textureLoader.load('./textures/matcap3.png')
        const material = new THREE.MeshMatcapMaterial(
            {matcap: matcap}
        )

        const gltfLoader = new GLTFLoader();
        gltfLoader.load('./model/portfolioObject.gltf',
            (gltf) => {
                // Recorrer los objetos hijos del modelo cargado
                gltf.scene.traverse((child) => {
                    // Si el hijo es una malla, aplicar el material
                    if (child.isMesh) {
                        child.material = material;
                    }
                });
                scene.add(gltf.scene);
            },
        );


        // Textures
        
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



        // Clean up scene
        return () => {
            currentMount.removeChild(renderer.domElement);
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
