import { useEffect, useRef } from "react";
import { cleanUpScene, initScene } from "./Script";

const Scene4 = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    initScene(mountRef);

    return () => {
      cleanUpScene();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ width: '100%', height: '100vh' }} 
    />
  );
};

export default Scene4;


