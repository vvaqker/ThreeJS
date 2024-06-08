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
    const spacing = 0.1; // Aumentar el espaciado entre partículas para reducir la cantidad total
    const columns = Math.ceil(window.innerWidth / (spacing * 100)); // Ajustar el cálculo de columnas para reducir la densidad
    const rows = Math.ceil(window.innerHeight / (spacing * 100)); // Ajustar el cálculo de filas para reducir la densidad
    const particleCount = columns * rows;

    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3); // Para almacenar las posiciones originales

    let index = 0;
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        particlePositions[index] = (i - columns / 2) * spacing;
        particlePositions[index + 1] = (j - rows / 2) * spacing;
        particlePositions[index + 2] = 0; // Z fijo en 0 para una cuadrícula plana

        // Guardar las posiciones originales
        initialPositions[index] = particlePositions[index];
        initialPositions[index + 1] = particlePositions[index + 1];
        initialPositions[index + 2] = particlePositions[index + 2];

        index += 3;
      }
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Material para partículas
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.02, // Tamaño de 2px para las partículas
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 5;

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

      // Si hay intersecciones, calcular el efecto de repulsión
      if (intersects.length > 0) {
        const mouseX = intersects[0].point.x;
        const mouseY = intersects[0].point.y;

        for (let i = 0; i < particleCount; i++) {
          const dx = mouseX - positions[i * 3];
          const dy = mouseY - positions[i * 3 + 1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repulsionRadius = 0.2; // Radio de repulsión de aproximadamente 20px
          const force = 0.1 / (distance + 0.1); // Fuerza de repulsión

          if (distance < repulsionRadius) {
            positions[i * 3] += dx * force;
            positions[i * 3 + 1] += dy * force;
          } else {
            // Usar gsap para animar la vuelta a la posición original
            gsap.to(positions, {
              duration: 0.5,
              [i * 3]: initialPositions[i * 3],
              [i * 3 + 1]: initialPositions[i * 3 + 1],
              [i * 3 + 2]: initialPositions[i * 3 + 2],
              overwrite: true,
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

