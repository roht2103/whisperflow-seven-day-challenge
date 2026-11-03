import * as THREE from 'three';

export interface FunnelSceneConfig {
  container: HTMLDivElement;
}

export class FunnelScene {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;

  // Particle System - tuned for atmospheric ambient flow without text obscuration
  private particleCount = 680;
  private particleGeometry!: THREE.BufferGeometry;
  private particleSystem!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleColors!: Float32Array;
  private particleData: Array<{
    progress: number;
    angle: number;
    radiusOffset: number;
    speed: number;
    vortexSpeed: number;
  }> = [];

  // Portal Rings & Chamber Landmarks
  private portalRings: THREE.Group[] = [];
  private funnelRingsGroup: THREE.Group = new THREE.Group();
  private guideLinesGroup: THREE.Group = new THREE.Group();
  private nexusGroup: THREE.Group = new THREE.Group();

  // Lighting
  private ambientLight!: THREE.AmbientLight;
  private cyanPointLight!: THREE.PointLight;
  private amberPointLight!: THREE.PointLight;

  // Camera Motion & Scroll Interpolation
  private scrollProgress = 0;
  private targetScrollProgress = 0;
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 0, 0);

  // Chamber depth landmarks
  private readonly zHero = 26;
  private readonly zAwareness = -15;
  private readonly zInterest = -50;
  private readonly zConsideration = -85;
  private readonly zHire = -122;
  private readonly zNexus = -145;

  constructor(config: FunnelSceneConfig) {
    this.container = config.container;
    this.clock = new THREE.Clock();

    // 1. Scene & Background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08090c);
    this.scene.fog = new THREE.FogExp2(0x08090c, 0.016);

    // 2. Camera
    const aspect = this.container.clientWidth / (this.container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 300);
    this.camera.position.set(0, 3.5, this.zHero);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Build elements
    this.setupLights();
    this.buildFunnelStructure();
    this.buildChamberPortals();
    this.buildNexusCore();
    this.buildUserFlowParticles();

    // 5. Events
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);

    // 6. Start Loop
    this.animate();
  }

  private setupLights() {
    this.ambientLight = new THREE.AmbientLight(0x0a101a, 1.8);
    this.scene.add(this.ambientLight);

    // Cyan lead light (Awareness & Discovery)
    this.cyanPointLight = new THREE.PointLight(0x06b6d4, 3.5, 90, 1.5);
    this.cyanPointLight.position.set(0, 5, 5);
    this.scene.add(this.cyanPointLight);

    // Warm amber conversion light (Consideration & Hire)
    this.amberPointLight = new THREE.PointLight(0xf59e0b, 4.0, 100, 1.4);
    this.amberPointLight.position.set(0, 0, this.zHire);
    this.scene.add(this.amberPointLight);
  }

  /**
   * Calculates funnel radius at any depth z
   * Narrows smoothly from top (z = +30, r = 24) to bottom (z = -140, r = 3.8)
   */
  private getFunnelRadius(z: number): number {
    // Normalization from z = +30 (t=0) to z = -140 (t=1)
    const t = Math.max(0, Math.min(1, (30 - z) / 170));
    // Conical contraction with smooth inflection
    return 24 * Math.pow(1 - t * 0.84, 1.4) + 0.8;
  }

  private createSoftParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      // Soft, non-glaring ambient gradient with feathered edge
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      gradient.addColorStop(0.25, 'rgba(255, 230, 180, 0.25)');
      gradient.addColorStop(0.6, 'rgba(245, 158, 11, 0.10)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private buildFunnelStructure() {
    this.scene.add(this.funnelRingsGroup);
    this.scene.add(this.guideLinesGroup);

    // 1. Horizontal Concentric Rib Rings along Z
    const ringCount = 48;
    const zStart = 32;
    const zEnd = -140;

    for (let i = 0; i <= ringCount; i++) {
      const t = i / ringCount;
      const z = zStart + t * (zEnd - zStart);
      const radius = this.getFunnelRadius(z);

      const segments = 64;
      const ringGeom = new THREE.BufferGeometry();
      const positions = new Float32Array(segments * 3);

      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        positions[s * 3] = Math.cos(theta) * radius;
        positions[s * 3 + 1] = Math.sin(theta) * radius;
        positions[s * 3 + 2] = 0;
      }

      ringGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Color shifts from cyan at top to amber at bottom
      const isMajor = i % 4 === 0;
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0x06b6d4),
        new THREE.Color(0xf59e0b),
        t
      );

      const ringMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: isMajor ? 0.35 : 0.12,
        blending: THREE.AdditiveBlending,
      });

      const ringLine = new THREE.LineLoop(ringGeom, ringMat);
      ringLine.position.z = z;
      this.funnelRingsGroup.add(ringLine);
    }

    // 2. Longitudinal Curved Guide Lines
    const guideCount = 16;
    for (let g = 0; g < guideCount; g++) {
      const angle = (g / guideCount) * Math.PI * 2;
      const curvePoints: THREE.Vector3[] = [];

      for (let s = 0; s <= 24; s++) {
        const t = s / 24;
        const z = zStart + t * (zEnd - zStart);
        const radius = this.getFunnelRadius(z);
        // Slight helical twist to emphasize funnel dynamic
        const twistedAngle = angle + t * 0.4;
        curvePoints.push(
          new THREE.Vector3(
            Math.cos(twistedAngle) * radius,
            Math.sin(twistedAngle) * radius,
            z
          )
        );
      }

      const spline = new THREE.CatmullRomCurve3(curvePoints);
      const splineGeom = new THREE.BufferGeometry().setFromPoints(spline.getPoints(80));

      const splineMat = new THREE.LineBasicMaterial({
        color: g % 2 === 0 ? 0x06b6d4 : 0xf59e0b,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      });

      const splineLine = new THREE.Line(splineGeom, splineMat);
      this.guideLinesGroup.add(splineLine);
    }
  }

  private buildChamberPortals() {
    // Portals at the 4 chamber thresholds (matching the reference UI screenshot palette)
    const chambers = [
      { z: this.zAwareness, name: 'Chances I took', color: 0xf59e0b, scale: 1.0 },
      { z: this.zInterest, name: 'Mistake Museum', color: 0x14b8a6, scale: 0.85 },
      { z: this.zConsideration, name: 'What I built', color: 0xe05a47, scale: 0.7 },
      { z: this.zHire, name: 'Hire', color: 0xfbbf24, scale: 0.55 },
    ];

    chambers.forEach((chamber, index) => {
      const group = new THREE.Group();
      group.position.z = chamber.z;
      const r = this.getFunnelRadius(chamber.z);

      // Inner glowing torus ring
      const torusGeom = new THREE.TorusGeometry(r, 0.12, 16, 64);
      const torusMat = new THREE.MeshBasicMaterial({
        color: chamber.color,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const torus = new THREE.Mesh(torusGeom, torusMat);
      group.add(torus);

      // Outer dashed marker ring
      const outerR = r + 0.8;
      const markerGeom = new THREE.RingGeometry(outerR - 0.08, outerR, 48);
      const markerMat = new THREE.MeshBasicMaterial({
        color: chamber.color,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const markerRing = new THREE.Mesh(markerGeom, markerMat);
      group.add(markerRing);

      // Radial ticks
      const ticksGroup = new THREE.Group();
      for (let t = 0; t < 12; t++) {
        const theta = (t / 12) * Math.PI * 2;
        const tickGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0),
          new THREE.Vector3(Math.cos(theta) * (r + 0.6), Math.sin(theta) * (r + 0.6), 0),
        ]);
        const tickLine = new THREE.Line(
          tickGeom,
          new THREE.LineBasicMaterial({ color: chamber.color, opacity: 0.5, transparent: true })
        );
        ticksGroup.add(tickLine);
      }
      group.add(ticksGroup);

      // Store in array for rotation in animate()
      group.userData = { rotationSpeed: (index % 2 === 0 ? 1 : -1) * 0.15 };
      this.portalRings.push(group);
      this.scene.add(group);
    });
  }

  private buildNexusCore() {
    this.nexusGroup.position.z = this.zNexus;

    // Glowing hire nexus target pedestal
    const coreR = 3.5;
    const nexusRingGeom = new THREE.TorusGeometry(coreR, 0.25, 24, 72);
    const nexusMat = new THREE.MeshBasicMaterial({
      color: 0xffaa1d,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const nexusRing = new THREE.Mesh(nexusRingGeom, nexusMat);
    this.nexusGroup.add(nexusRing);

    // Concentric inner target rings
    for (let i = 1; i <= 3; i++) {
      const subR = coreR * (1 - i * 0.25);
      const subGeom = new THREE.RingGeometry(subR - 0.05, subR, 36);
      const subMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x06b6d4 : 0xfbbf24,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(subGeom, subMat);
      this.nexusGroup.add(ring);
    }

    // Central energetic beam shooting forward
    const beamGeom = new THREE.CylinderGeometry(0.08, 0.6, 35, 16);
    beamGeom.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffaa1d,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.z = 15;
    this.nexusGroup.add(beam);

    this.scene.add(this.nexusGroup);
  }

  private buildUserFlowParticles() {
    this.particleGeometry = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleColors = new Float32Array(this.particleCount * 3);

    const cyanColor = new THREE.Color(0x06b6d4);
    const amberColor = new THREE.Color(0xf59e0b);
    const goldColor = new THREE.Color(0xffaa1d);

    for (let i = 0; i < this.particleCount; i++) {
      // Progress from 0 (intake top z = 32) to 1 (nexus bottom z = -140)
      const progress = Math.random();
      const angle = Math.random() * Math.PI * 2;
      // Keep central corridor clear for reading legibility; particles stay on perimeter walls
      const radiusOffset = 0.68 + Math.random() * 0.32;
      const speed = 0.03 + Math.random() * 0.05;
      const vortexSpeed = (0.15 + Math.random() * 0.45) * (Math.random() > 0.5 ? 1 : -1);

      this.particleData.push({ progress, angle, radiusOffset, speed, vortexSpeed });

      // Initial coordinates
      const z = 32 - progress * (32 - (-140));
      const funnelR = this.getFunnelRadius(z);
      const r = funnelR * radiusOffset;

      this.particlePositions[i * 3] = Math.cos(angle) * r;
      this.particlePositions[i * 3 + 1] = Math.sin(angle) * r;
      this.particlePositions[i * 3 + 2] = z;

      // Color based on depth
      const color = new THREE.Color();
      if (progress < 0.35) {
        color.copy(cyanColor);
      } else if (progress < 0.7) {
        color.lerpColors(cyanColor, amberColor, (progress - 0.35) / 0.35);
      } else {
        color.lerpColors(amberColor, goldColor, (progress - 0.7) / 0.3);
      }

      this.particleColors[i * 3] = color.r;
      this.particleColors[i * 3 + 1] = color.g;
      this.particleColors[i * 3 + 2] = color.b;
    }

    this.particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.particlePositions, 3)
    );
    this.particleGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(this.particleColors, 3)
    );

    // Subtle, elegant point size and soft opacity to prevent interfering with readability
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.75,
      vertexColors: true,
      map: this.createSoftParticleTexture(),
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(this.particleGeometry, particleMaterial);
    this.scene.add(this.particleSystem);
  }

  private updateParticles(delta: number) {
    const positions = this.particlePositions;
    const colors = this.particleColors;
    const cyanColor = new THREE.Color(0x06b6d4);
    const amberColor = new THREE.Color(0xf59e0b);
    const goldColor = new THREE.Color(0xffaa1d);
    const camZ = this.camera ? this.camera.position.z : 0;

    for (let i = 0; i < this.particleCount; i++) {
      const data = this.particleData[i];

      // Physical funnel flow: acceleration as funnel constricts
      const constrictionFactor = 1 + data.progress * 1.5;
      data.progress += data.speed * 0.35 * constrictionFactor * delta;

      // Respawn at top if reached nexus
      if (data.progress >= 1.0) {
        data.progress = 0;
        data.angle = Math.random() * Math.PI * 2;
        data.radiusOffset = 0.68 + Math.random() * 0.32;
      }

      // Vortex rotation on outer walls
      data.angle += data.vortexSpeed * (1 + data.progress * 1.5) * delta;

      const z = 32 - data.progress * (32 - (-140));
      const funnelR = this.getFunnelRadius(z);
      const r = funnelR * data.radiusOffset;

      positions[i * 3] = Math.cos(data.angle) * r;
      positions[i * 3 + 1] = Math.sin(data.angle) * r;
      positions[i * 3 + 2] = z;

      // Base color by depth
      const color = new THREE.Color();
      if (data.progress < 0.35) {
        color.copy(cyanColor);
      } else if (data.progress < 0.7) {
        color.lerpColors(cyanColor, amberColor, (data.progress - 0.35) / 0.35);
      } else {
        color.lerpColors(amberColor, goldColor, (data.progress - 0.7) / 0.3);
      }

      // Smooth proximity fade: if particle is near camera plane, fade it out so it never flashes over text
      const distToCam = Math.abs(z - camZ);
      const proximityFactor = Math.min(1.0, Math.max(0.08, distToCam / 12));
      color.multiplyScalar(proximityFactor);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.color.needsUpdate = true;
  }

  /**
   * Toggle particle system visibility (for Focus / High-Contrast Reading Mode)
   */
  public setParticleVisibility(visible: boolean) {
    if (this.particleSystem) {
      this.particleSystem.visible = visible;
    }
  }

  /**
   * Called on external scroll events.
   * progress: normalized scroll value [0, 1]
   */
  public setScrollProgress(progress: number) {
    this.targetScrollProgress = Math.max(0, Math.min(1, progress));
  }

  private onMouseMove = (e: MouseEvent) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.mouse.targetX = (e.clientX / width) * 2 - 1;
    this.mouse.targetY = -(e.clientY / height) * 2 + 1;
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Computes the 3D camera trajectory along the funnel path
   */
  private updateCameraPath(delta: number) {
    // Smooth dampening of scroll progress
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * (1 - Math.exp(-4.5 * delta));

    // Smooth dampening of mouse parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * (1 - Math.exp(-6 * delta));
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * (1 - Math.exp(-6 * delta));

    // Define 5 key camera poses: Hero, Awareness, Interest, Consideration, Hire
    // Points along the central funnel axis with subtle lateral drift for dramatic cinematic framing
    const t = this.scrollProgress;

    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();

    if (t <= 0.25) {
      // Hero (0.0) -> Chamber 1: Chances I took (0.25)
      // On hero (u=0), offset camera so 3D funnel gracefully frames the right half, exactly matching Screenshot 1
      const u = t / 0.25;
      const camZ = THREE.MathUtils.lerp(this.zHero, this.zAwareness + 8, u);
      const camX = THREE.MathUtils.lerp(-3.8, 0, u);
      const camY = THREE.MathUtils.lerp(2.8, 1.2, u);
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(THREE.MathUtils.lerp(1.2, 0, u), 0, camZ - 20);
    } else if (t <= 0.5) {
      // Awareness (0.25) -> Chamber 2: Interest (0.50)
      const u = (t - 0.25) / 0.25;
      const camZ = THREE.MathUtils.lerp(this.zAwareness + 8, this.zInterest + 6, u);
      const camX = THREE.MathUtils.lerp(1.2, -1.4, u);
      const camY = THREE.MathUtils.lerp(1.8, 1.0, u);
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(0, 0, camZ - 22);
    } else if (t <= 0.75) {
      // Interest (0.50) -> Chamber 3: Consideration (0.75)
      const u = (t - 0.5) / 0.25;
      const camZ = THREE.MathUtils.lerp(this.zInterest + 6, this.zConsideration + 5, u);
      const camX = THREE.MathUtils.lerp(-1.4, 0.9, u);
      const camY = THREE.MathUtils.lerp(1.0, 0.4, u);
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(0, 0, camZ - 20);
    } else {
      // Consideration (0.75) -> Chamber 4: Hire (1.00)
      const u = (t - 0.75) / 0.25;
      const camZ = THREE.MathUtils.lerp(this.zConsideration + 5, this.zHire + 3, u);
      const camX = THREE.MathUtils.lerp(0.9, 0.0, u);
      const camY = THREE.MathUtils.lerp(0.4, 0.0, u);
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(0, 0, this.zNexus);
    }

    // Apply gentle mouse parallax offset
    const parallaxFactor = 0.8;
    targetCamPos.x += this.mouse.x * parallaxFactor;
    targetCamPos.y += this.mouse.y * parallaxFactor;

    // Camera smoothing
    this.camera.position.lerp(targetCamPos, 1 - Math.exp(-5.0 * delta));
    this.currentCameraLookAt.lerp(targetLookAt, 1 - Math.exp(-5.0 * delta));
    this.camera.lookAt(this.currentCameraLookAt);

    // Dynamic light movement and intensity based on chamber progress
    this.cyanPointLight.position.set(
      Math.sin(this.clock.getElapsedTime() * 0.8) * 4,
      3,
      this.camera.position.z - 10
    );

    // Shift light colors: Cyan dominant early, Amber dominant deep
    const amberIntensity = THREE.MathUtils.lerp(1.5, 6.0, t);
    const cyanIntensity = THREE.MathUtils.lerp(4.5, 1.2, t);
    this.amberPointLight.intensity = amberIntensity;
    this.cyanPointLight.intensity = cyanIntensity;
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // 1. Rotate Chamber Portal Rings
    this.portalRings.forEach((portal) => {
      portal.rotation.z += (portal.userData.rotationSpeed || 0.1) * delta;
    });

    // 2. Pulse Nexus Core
    if (this.nexusGroup) {
      this.nexusGroup.rotation.z += 0.3 * delta;
      const scale = 1 + Math.sin(elapsed * 2.5) * 0.04;
      this.nexusGroup.scale.set(scale, scale, 1);
    }

    // 3. Gentle structural funnel rotation
    this.funnelRingsGroup.rotation.z = Math.sin(elapsed * 0.1) * 0.05;
    this.guideLinesGroup.rotation.z += 0.04 * delta;

    // 4. Update particles and camera
    this.updateParticles(delta);
    this.updateCameraPath(delta);

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);

    if (this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

