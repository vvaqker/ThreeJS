// src/Particles.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const Particles = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Configuración básica de Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Crear sistema de partículas
    const spacing = 0.15; // Espaciado entre partículas
    const particleSize = 0.01; // Tamaño de la partícula en unidades del espacio
    const columns = Math.ceil(window.innerWidth / spacing);
    const rows = Math.ceil(window.innerHeight / spacing);
    const particleCount = columns * rows;

    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3);

    let index = 0;
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        particlePositions[index] = (i - columns / 2) * spacing;
        particlePositions[index + 1] = (j - rows / 2) * spacing;
        particlePositions[index + 2] = 0;

        initialPositions[index] = particlePositions[index];
        initialPositions[index + 1] = particlePositions[index + 1];
        initialPositions[index + 2] = particlePositions[index + 2];

        index += 3;
      }
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Material para partículas
    const particleMaterial = new THREE.PointsMaterial({
      size: particleSize, // Tamaño de 1px para las partículas
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 10; // Ajustar la posición de la cámara para ver toda la cuadrícula

    // Animación y renderizado continuo
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Repulsión y regreso a la posición original
    const onMouseMove = (event) => {
      // Calcular posición del mouse en el espacio de la cuadrícula
      const mouse = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0
      );

      // Usar el Raycaster de Three.js para mapear la posición del mouse
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(particleSystem);

      const positions = particles.attributes.position.array;

      if (intersects.length > 0) {
        const mouseX = intersects[0].point.x;
        const mouseY = intersects[0].point.y;
        const repulsionRadius = 0.3; // Radio de repulsión de aproximadamente 30px

        for (let i = 0; i < particleCount; i++) {
          const dx = positions[i * 3] - mouseX;
          const dy = positions[i * 3 + 1] - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < repulsionRadius) {
            // Desplazar partículas fuera del radio de repulsión
            const force = (repulsionRadius - distance) / repulsionRadius;
            positions[i * 3] += dx / distance * force * 0.1;
            positions[i * 3 + 1] += dy / distance * force * 0.1;
          } else {
            // Volver rápidamente a la posición original
            gsap.to(positions, {
              [i * 3]: initialPositions[i * 3],
              [i * 3 + 1]: initialPositions[i * 3 + 1],
              [i * 3 + 2]: initialPositions[i * 3 + 2],
              duration: 0.3,
              overwrite: true,
              ease: 'power3.out',
            });
          }
        }
      }

      particles.attributes.position.needsUpdate = true;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Manejar la limpieza del componente
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener('mousemove', onMouseMove);
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Particles;




