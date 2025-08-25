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

    // Japanese anime-inspired colorful base with rounded edges
    const baseGeometry = new THREE.BoxGeometry(4.5, 0.4, 3.5);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFC107, // Bold yellow base
      shininess: 80,
      emissive: 0xFFC107,
      emissiveIntensity: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.5;
    base.castShadow = true;
    base.receiveShadow = true;
    machineGroup.add(base);

    // Colorful glass case with anime-inspired transparency
    const glassGeometry = new THREE.BoxGeometry(4.2, 3.5, 3.2);
    const glassMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4CAF50, // Fresh green tint
      transparent: true,
      opacity: 0.15,
      shininess: 120,
      emissive: 0x4CAF50,
      emissiveIntensity: 0.05
    });
    const glassCase = new THREE.Mesh(glassGeometry, glassMaterial);
    glassCase.position.y = 0.3;
    machineGroup.add(glassCase);

    // Colorful anime-inspired frame edges
    const edgeGeometry = new THREE.BoxGeometry(4.5, 0.15, 3.5);
    const edgeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFF6B35, // Orange accent
      emissive: 0xFFC107,
      emissiveIntensity: 0.3
    });
    const topEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    topEdge.position.y = 2.1;
    machineGroup.add(topEdge);

    // Anime-inspired colorful control panel
    const panelGeometry = new THREE.BoxGeometry(1.2, 1, 0.4);
    const panelMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFF1744, // Bright red for anime feel
      emissive: 0x4CAF50,
      emissiveIntensity: 0.2
    });
    const controlPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    controlPanel.position.set(2.8, 0.2, 2);
    machineGroup.add(controlPanel);

    // Anime-inspired colorful claw mechanism
    const clawGroup = new THREE.Group();
    clawRef.current = clawGroup;

    // Colorful claw rail with anime styling
    const railGeometry = new THREE.CylinderGeometry(0.08, 0.08, 4);
    const railMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x9C27B0, // Purple rail for anime feel
      emissive: 0x9C27B0,
      emissiveIntensity: 0.1,
      shininess: 100
    });
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.rotation.z = Math.PI / 2;
    rail.position.y = 1.8;
    clawGroup.add(rail);

    // Bright anime-inspired claw arm
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.8);
    const armMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00BCD4, // Cyan for anime contrast
      emissive: 0xFFC107,
      emissiveIntensity: 0.2
    });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.y = 1;
    clawGroup.add(arm);

    // Anime-style colorful claw head
    const clawHeadGeometry = new THREE.SphereGeometry(0.18, 12, 8);
    const clawHeadMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xE91E63, // Pink for anime aesthetic
      emissive: 0xE91E63,
      emissiveIntensity: 0.15,
      shininess: 90
    });
    const clawHead = new THREE.Mesh(clawHeadGeometry, clawHeadMaterial);
    clawHead.position.y = 0.2;
    clawGroup.add(clawHead);

    // Anime-style colorful claw fingers
    for (let i = 0; i < 4; i++) {
      const fingerGeometry = new THREE.BoxGeometry(0.04, 0.35, 0.04);
      const fingerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFEB3B, // Bright yellow fingers
        emissive: 0xFFEB3B,
        emissiveIntensity: 0.1
      });
      const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
      const angle = (i / 4) * Math.PI * 2;
      finger.position.set(
        Math.cos(angle) * 0.12,
        -0.08,
        Math.sin(angle) * 0.12
      );
      finger.rotation.z = Math.cos(angle) * 0.3;
      finger.rotation.x = Math.sin(angle) * 0.3;
      clawHead.add(finger);
    }

    machineGroup.add(clawGroup);

    // Create anime-inspired 3D food plushies
    createFoodPlushies(machineGroup);

    // Add colorful anime-inspired particle effects
    createParticleEffects(scene);

    scene.add(machineGroup);
  };

  // Create anime-inspired 3D food plushies with vibrant colors
  const createFoodPlushies = (parent: THREE.Group) => {
    const plushies = [
      { emoji: '🍕', color: 0xFF5722, position: [-1.2, -0.6, 0.8], emissive: 0xFF5722 },
      { emoji: '🌮', color: 0x8BC34A, position: [0.3, -0.6, -0.8], emissive: 0x8BC34A },
      { emoji: '🍔', color: 0xFFD54F, position: [1.1, -0.6, 0.5], emissive: 0xFFD54F },
      { emoji: '🍟', color: 0xFFC107, position: [-0.5, -0.6, 0.2], emissive: 0xFFC107 },
      { emoji: '🍦', color: 0xE1BEE7, position: [0.8, -0.6, -0.3], emissive: 0xE1BEE7 }
    ];

    plushies.forEach((plushie, index) => {
      // Create anime-style plushie base with more vibrant colors
      const plushieGeometry = new THREE.SphereGeometry(0.25, 16, 12);
      const plushieMaterial = new THREE.MeshPhongMaterial({ 
        color: plushie.color,
        emissive: plushie.emissive,
        emissiveIntensity: 0.2,
        shininess: 60
      });
      const plushieMesh = new THREE.Mesh(plushieGeometry, plushieMaterial);
      plushieMesh.position.set(...plushie.position as [number, number, number]);
      plushieMesh.castShadow = true;
      plushieMesh.receiveShadow = true;
      
      // Add gentle floating animation
      plushieMesh.userData = { 
        originalY: plushie.position[1],
        floatOffset: index * Math.PI * 0.5,
        floatSpeed: 0.015 + index * 0.005 // Varied speeds for anime feel
      };
      
      parent.add(plushieMesh);
    });
  };

  // Create anime-inspired colorful particle effects
  const createParticleEffects = (scene: THREE.Scene) => {
    const particleCount = 80;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Anime color palette
    const animeColors = [
      new THREE.Color(0xFFC107), // Yellow
      new THREE.Color(0x4CAF50), // Green
      new THREE.Color(0xFF6B35), // Orange
      new THREE.Color(0xE91E63), // Pink
      new THREE.Color(0x9C27B0), // Purple
      new THREE.Color(0x00BCD4)  // Cyan
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Assign random anime colors
      const color = animeColors[Math.floor(Math.random() * animeColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
      sizeAttenuation: true
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
      clawRef.current.position.x = Math.sin(time * 0.4) * 1.5;
      clawRef.current.position.z = Math.cos(time * 0.25) * 1;
      
      // More dramatic anime-style drop animation
      const dropCycle = Math.sin(time * 0.15);
      if (dropCycle > 0.85) {
        clawRef.current.position.y = 0.4 - (dropCycle - 0.85) * 3;
      } else {
        clawRef.current.position.y = 0.4;
      }
    }

    // Animate food plushies with anime-style floating
    if (machineRef.current) {
      machineRef.current.children.forEach((child) => {
        if (child.userData.originalY !== undefined) {
          const floatY = child.userData.originalY + 
            Math.sin(time * child.userData.floatSpeed + child.userData.floatOffset) * 0.15;
          child.position.y = floatY;
          child.rotation.y = time * 0.3 + child.userData.floatOffset;
          child.rotation.x = Math.sin(time * 0.4 + child.userData.floatOffset) * 0.1;
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
          {/* Japanese anime-inspired static SVG fallback */}
          <svg 
            viewBox="0 0 400 300" 
            className="w-full h-64 mx-auto"
            role="img"
            aria-label="Colorful Japanese anime-inspired claw machine with food plushies"
          >
            {/* Colorful anime-inspired machine frame */}
            <rect x="15" y="35" width="370" height="230" rx="25" fill="#FFC107" stroke="#FF6B35" strokeWidth="4"/>
            <rect x="25" y="45" width="350" height="210" rx="20" fill="rgba(76,175,80,0.2)"/>
            
            {/* Anime-style glass front with gradient */}
            <defs>
              <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(76,175,80,0.3)"/>
                <stop offset="50%" stopColor="rgba(255,193,7,0.2)"/>
                <stop offset="100%" stopColor="rgba(255,107,53,0.3)"/>
              </linearGradient>
            </defs>
            <rect x="30" y="50" width="340" height="200" rx="15" fill="url(#glassGrad)" stroke="#4CAF50" strokeWidth="3"/>
            
            {/* Colorful anime-style food plushies */}
            <g>
              <circle cx="80" cy="190" r="22" fill="#FF5722"/>
              <text x="80" y="198" textAnchor="middle" fontSize="20">🍕</text>
              
              <circle cx="160" cy="210" r="22" fill="#8BC34A"/>
              <text x="160" y="218" textAnchor="middle" fontSize="20">🌮</text>
              
              <circle cx="240" cy="185" r="22" fill="#FFD54F"/>
              <text x="240" y="193" textAnchor="middle" fontSize="20">🍔</text>
              
              <circle cx="320" cy="205" r="22" fill="#FFC107"/>
              <text x="320" y="213" textAnchor="middle" fontSize="20">🍟</text>
            </g>
            
            {/* Anime-style colorful claw */}
            <g>
              <rect x="40" y="15" width="320" height="10" rx="5" fill="#9C27B0"/>
              <rect x="190" y="25" width="12" height="90" fill="#00BCD4"/>
              <circle cx="196" cy="125" r="15" fill="#E91E63"/>
              
              {/* Claw fingers */}
              <rect x="185" y="135" width="4" height="20" rx="2" fill="#FFEB3B"/>
              <rect x="195" y="135" width="4" height="20" rx="2" fill="#FFEB3B"/>
              <rect x="205" y="135" width="4" height="20" rx="2" fill="#FFEB3B"/>
            </g>
            
            {/* Anime-inspired machine top with gradient */}
            <defs>
              <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B35"/>
                <stop offset="50%" stopColor="#FFC107"/>
                <stop offset="100%" stopColor="#4CAF50"/>
              </linearGradient>
            </defs>
            <rect x="5" y="5" width="390" height="45" rx="25" fill="url(#topGrad)"/>
            <text x="200" y="35" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">🎮 DOLLAR ARCADE 🎮</text>
            
            {/* Anime-style decorative elements */}
            <circle cx="340" cy="28" r="10" fill="#E91E63" opacity="0.9"/>
            <text x="340" y="33" textAnchor="middle" fontSize="12" fill="white">💰</text>
            
            <circle cx="60" cy="28" r="10" fill="#00BCD4" opacity="0.9"/>
            <text x="60" y="33" textAnchor="middle" fontSize="12" fill="white">⭐</text>
          </svg>
          
          {/* Anime-inspired UI elements */}
          <div className="absolute top-4 right-4 flex space-x-3">
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl shadow-lg animate-pulse">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-2 rounded-xl shadow-lg animate-pulse delay-300">
              <Coins className="h-5 w-5 text-white" />
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
        <div className="absolute top-4 left-4 flex space-x-3">
          <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl shadow-lg animate-pulse">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-2 rounded-xl shadow-lg animate-pulse delay-300">
            <Coins className="h-5 w-5 text-white" />
          </div>
        </div>
        
        {/* Interaction hint */}
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
          {isInteracting ? 'Spinning...' : 'Click & drag to spin'}
        </div>
        
        {/* Anime-inspired glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 via-yellow-400/10 to-purple-400/10 rounded-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ClawMachine3D;