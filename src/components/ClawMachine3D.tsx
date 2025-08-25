import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Zap, Coins, Sparkles } from 'lucide-react';

interface ClawMachine3DProps {
  className?: string;
}

const ClawMachine3D: React.FC<ClawMachine3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const clawRef = useRef<THREE.Group>();
  const machineRef = useRef<THREE.Group>();
  const animationRef = useRef<number>();
  const [isInteracting, setIsInteracting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const rotationRef = useRef({ x: 0, y: 0, targetY: 0 });

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!mountRef.current || prefersReducedMotion) return;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc); // Neutral background
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        45,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 2, 8);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      rendererRef.current = renderer;

      mountRef.current.appendChild(renderer.domElement);

      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      scene.add(directionalLight);

      // Create claw machine
      createClawMachine(scene);
      
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to initialize 3D scene:', err);
      setError(true);
    }
  }, [prefersReducedMotion]);

  // Create the 3D claw machine
  const createClawMachine = (scene: THREE.Scene) => {
    const machineGroup = new THREE.Group();
    machineRef.current = machineGroup;

    // Machine base (Web3-inspired with neon accents)
    const baseGeometry = new THREE.BoxGeometry(4, 0.3, 3);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      shininess: 100
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.5;
    base.castShadow = true;
    base.receiveShadow = true;
    machineGroup.add(base);

    // Glass case with Web3 glow
    const glassGeometry = new THREE.BoxGeometry(3.8, 3, 2.8);
    const glassMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      shininess: 100
    });
    const glassCase = new THREE.Mesh(glassGeometry, glassMaterial);
    glassCase.position.y = 0.3;
    machineGroup.add(glassCase);

    // Neon frame edges (Web3 accent)
    const edgeGeometry = new THREE.BoxGeometry(4, 0.1, 3);
    const edgeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFC107, // Bold yellow
      emissive: 0xFFC107,
      emissiveIntensity: 0.2
    });
    const topEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    topEdge.position.y = 1.8;
    machineGroup.add(topEdge);

    // Control panel with Web3 styling
    const panelGeometry = new THREE.BoxGeometry(1, 0.8, 0.3);
    const panelMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4CAF50, // Fresh green
      emissive: 0x4CAF50,
      emissiveIntensity: 0.1
    });
    const controlPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    controlPanel.position.set(2.5, 0, 1.8);
    machineGroup.add(controlPanel);

    // Create claw mechanism
    const clawGroup = new THREE.Group();
    clawRef.current = clawGroup;

    // Claw rail (futuristic design)
    const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3.5);
    const railMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2
    });
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.rotation.z = Math.PI / 2;
    rail.position.y = 1.5;
    clawGroup.add(rail);

    // Claw arm with Web3 glow
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5);
    const armMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFC107,
      emissive: 0xFFC107,
      emissiveIntensity: 0.1
    });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.y = 0.8;
    clawGroup.add(arm);

    // Claw head (3D design)
    const clawHeadGeometry = new THREE.SphereGeometry(0.15, 8, 6);
    const clawHeadMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3
    });
    const clawHead = new THREE.Mesh(clawHeadGeometry, clawHeadMaterial);
    clawHead.position.y = 0.1;
    clawGroup.add(clawHead);

    // Claw fingers (3D prongs)
    for (let i = 0; i < 3; i++) {
      const fingerGeometry = new THREE.BoxGeometry(0.03, 0.3, 0.03);
      const fingerMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
      const angle = (i / 3) * Math.PI * 2;
      finger.position.set(
        Math.cos(angle) * 0.1,
        -0.05,
        Math.sin(angle) * 0.1
      );
      finger.rotation.z = Math.cos(angle) * 0.3;
      finger.rotation.x = Math.sin(angle) * 0.3;
      clawHead.add(finger);
    }

    machineGroup.add(clawGroup);

    // Create 3D food plushies
    createFoodPlushies(machineGroup);

    // Add Web3-inspired particle effects
    createParticleEffects(scene);

    scene.add(machineGroup);
  };

  // Create 3D food plushies
  const createFoodPlushies = (parent: THREE.Group) => {
    const plushies = [
      { emoji: '🍕', color: 0xFF6B35, position: [-1, -0.8, 0.5] },
      { emoji: '🌮', color: 0x4CAF50, position: [0.5, -0.8, -0.5] },
      { emoji: '🍔', color: 0xFFC107, position: [1, -0.8, 0.8] }
    ];

    plushies.forEach((plushie, index) => {
      // Create plushie base
      const plushieGeometry = new THREE.SphereGeometry(0.3, 12, 8);
      const plushieMaterial = new THREE.MeshPhongMaterial({ 
        color: plushie.color,
        shininess: 30
      });
      const plushieMesh = new THREE.Mesh(plushieGeometry, plushieMaterial);
      plushieMesh.position.set(...plushie.position as [number, number, number]);
      plushieMesh.castShadow = true;
      plushieMesh.receiveShadow = true;
      
      // Add gentle floating animation
      plushieMesh.userData = { 
        originalY: plushie.position[1],
        floatOffset: index * Math.PI * 0.7,
        floatSpeed: 0.02
      };
      
      parent.add(plushieMesh);
    });
  };

  // Create Web3-inspired particle effects
  const createParticleEffects = (scene: THREE.Scene) => {
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xFFC107,
      size: 0.02,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
  };

  // Animation loop
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || prefersReducedMotion) {
      return;
    }

    const time = Date.now() * 0.001;

    // Animate claw movement
    if (clawRef.current && !isInteracting) {
      clawRef.current.position.x = Math.sin(time * 0.5) * 1.2;
      clawRef.current.position.z = Math.cos(time * 0.3) * 0.8;
      
      // Occasional drop animation
      const dropCycle = Math.sin(time * 0.2);
      if (dropCycle > 0.8) {
        clawRef.current.position.y = 0.3 - (dropCycle - 0.8) * 2;
      } else {
        clawRef.current.position.y = 0.3;
      }
    }

    // Animate food plushies floating
    if (machineRef.current) {
      machineRef.current.children.forEach((child) => {
        if (child.userData.originalY !== undefined) {
          const floatY = child.userData.originalY + 
            Math.sin(time * child.userData.floatSpeed + child.userData.floatOffset) * 0.1;
          child.position.y = floatY;
          child.rotation.y = time * 0.5 + child.userData.floatOffset;
        }
      });
    }

    // Smooth rotation during interaction
    if (machineRef.current) {
      rotationRef.current.y += (rotationRef.current.targetY - rotationRef.current.y) * 0.1;
      machineRef.current.rotation.y = rotationRef.current.y;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationRef.current = requestAnimationFrame(animate);
  }, [isInteracting, prefersReducedMotion]);

  // Mouse/touch interaction handlers
  const handleMouseDown = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setIsInteracting(true);
    mouseRef.current.isDown = true;
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    mouseRef.current.x = clientX;
    mouseRef.current.y = clientY;
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!mouseRef.current.isDown || prefersReducedMotion) return;
    
    event.preventDefault();
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const deltaX = clientX - mouseRef.current.x;
    
    rotationRef.current.targetY += deltaX * 0.01;
    mouseRef.current.x = clientX;
  }, [prefersReducedMotion]);

  const handleMouseUp = useCallback(() => {
    setIsInteracting(false);
    mouseRef.current.isDown = false;
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (prefersReducedMotion) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        rotationRef.current.targetY -= 0.2;
        break;
      case 'ArrowRight':
        rotationRef.current.targetY += 0.2;
        break;
    }
  }, [prefersReducedMotion]);

  // Initialize scene
  useEffect(() => {
    if (!prefersReducedMotion && !error) {
      const timer = setTimeout(() => {
        initScene();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initScene, prefersReducedMotion, error]);

  // Start animation
  useEffect(() => {
    if (isLoaded && !prefersReducedMotion) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, isLoaded, prefersReducedMotion]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Fallback for reduced motion or errors
  if (prefersReducedMotion || error) {
    return (
      <div className={`relative ${className}`}>
        <div className="food-card p-8 relative overflow-hidden">
          {/* Static SVG fallback */}
          <svg 
            viewBox="0 0 400 300" 
            className="w-full h-64 mx-auto"
            role="img"
            aria-label="Static claw machine with food plushies"
          >
            {/* Machine Frame */}
            <rect x="20" y="40" width="360" height="220" rx="20" fill="#000000" stroke="#FFC107" strokeWidth="3"/>
            <rect x="30" y="50" width="340" height="200" rx="15" fill="rgba(255,255,255,0.1)"/>
            
            {/* Glass Front */}
            <rect x="35" y="55" width="330" height="190" rx="10" fill="rgba(255,255,255,0.2)" stroke="#4CAF50" strokeWidth="2"/>
            
            {/* Food Plushies */}
            <g>
              <circle cx="100" cy="200" r="25" fill="#FF6B35"/>
              <text x="100" y="208" textAnchor="middle" fontSize="24">🍕</text>
              
              <circle cx="200" cy="180" r="25" fill="#4CAF50"/>
              <text x="200" y="188" textAnchor="middle" fontSize="24">🌮</text>
              
              <circle cx="300" cy="210" r="25" fill="#FFC107"/>
              <text x="300" y="218" textAnchor="middle" fontSize="24">🍔</text>
            </g>
            
            {/* Claw */}
            <g>
              <rect x="50" y="20" width="300" height="8" rx="4" fill="#666666"/>
              <rect x="195" y="28" width="10" height="80" fill="#FFC107"/>
              <circle cx="200" cy="120" r="12" fill="#333333"/>
            </g>
            
            {/* Machine Top */}
            <rect x="10" y="10" width="380" height="40" rx="20" fill="#000000"/>
            <text x="200" y="35" textAnchor="middle" fontSize="18" fill="#FFC107" fontWeight="bold">DOLLAR ARCADE</text>
            
            {/* Web3 Accents */}
            <circle cx="350" cy="30" r="8" fill="#4CAF50" opacity="0.8"/>
            <text x="350" y="35" textAnchor="middle" fontSize="10" fill="white">$</text>
          </svg>
          
          {/* Web3 UI Elements */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg shadow-lg">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-lg shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 3D Canvas Container */}
      <div className="food-card p-8 relative overflow-hidden bg-gradient-to-br from-neutral-50 to-white">
        <div
          ref={mountRef}
          className="w-full h-64 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ touchAction: 'none' }}
          role="img"
          aria-label="Interactive 3D claw machine - click and drag to rotate"
          tabIndex={0}
        />
        
        {/* Loading state */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading 3D experience...</p>
            </div>
          </div>
        )}
        
        {/* Web3 UI Overlay */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg shadow-lg animate-pulse">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-lg shadow-lg animate-pulse delay-300">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
        
        {/* Interaction hint */}
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
          {isInteracting ? 'Spinning...' : 'Click & drag to spin'}
        </div>
        
        {/* Web3 Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-green-400/10 rounded-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ClawMachine3D;