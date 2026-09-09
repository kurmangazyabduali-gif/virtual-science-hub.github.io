/**
 * Virtual Science Hub — High-Poly Interactive 3D Cyber Robot Background Engine
 * Features: High-Poly Subdivided Geometries, 100% Crisp Unblurred Rendering, Side Position, Quantum Reactor, Energy Conduits & Smooth LERP
 */

(function () {
    let scene, camera, renderer;
    let robotGroup, robotHead, robotTorso, robotArmR, robotArmL;
    let proceduralRobot = null;
    let glbRobot = null;
    let particleAura = null;

    // References for animations
    let eyeLMesh = null, eyeRMesh = null;
    let emoPurpleMat = null, tealAccentMat = null, cyanEyesMat = null;

    // Mouse tracking & LERP variables
    let mouseX = 0, mouseY = 0;
    let targetRotY = 0, targetRotX = 0;
    let currentRotY = 0, currentRotX = 0;
    let basePosY = -0.45;

    // Lighting references
    let ambientLight, mainLight, fillLight, accentLight, pointGlow, rimLight;

    function init3DRobot() {
        const canvas = document.getElementById('robot-canvas');
        if (!canvas) return;

        // 1. THREE.JS SCENE SETUP
        scene = new THREE.Scene();

        // 2. PERSPECTIVE CAMERA
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

        // 3. HIGH-PERFORMANCE WEBGL RENDERER WITH SMOOTH SHADING
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

        // Set camera position after renderer initialization
        updateCameraPosition();

        // 4. STUDIO-GRADE HIGH-CONTRAST LIGHTING SETUP
        ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        mainLight = new THREE.DirectionalLight(0xfff5ea, 1.8); // Warm Keylight
        mainLight.position.set(6, 10, 7);
        scene.add(mainLight);

        fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8); // Soft Cyan Fill Light
        fillLight.position.set(-6, 4, -3);
        scene.add(fillLight);

        rimLight = new THREE.DirectionalLight(0xa855f7, 0.9); // Top Sci-Fi Rim Light
        rimLight.position.set(0, 8, -5);
        scene.add(rimLight);

        pointGlow = new THREE.PointLight(0x00f3ff, 1.0, 10); // Underglow accent
        pointGlow.position.set(2, -1, 2);
        scene.add(pointGlow);

        // Root Robot Group
        robotGroup = new THREE.Group();
        scene.add(robotGroup);

        // 5. CREATE FLOATING QUANTUM PARTICLE NEBULA
        createParticleAura();

        // 6. LOAD FUTURISTIC 3D ROBOT GLB (with procedural fallback)
        createUltraHighPolyRobot();
        loadGLBRobot();

        // 7. EVENT LISTENERS (Mouse + Mobile Touch Support)
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchstart', onTouchMove, { passive: true });
        window.addEventListener('resize', onWindowResize);

        // Theme Mutation Observer
        const observer = new MutationObserver(updateLightingForTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        updateLightingForTheme();

        // 8. ANIMATION LOOP
        animate();
    }

    function updateCameraPosition() {
        if (!camera) return;
        const width = window.innerWidth;
        const isMobile = width < 768;
        
        if (renderer) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
        }

        if (width < 768) {
            // Mobile: compact right-centered floating position
            camera.position.set(0, -0.1, 5.2);
            basePosY = -0.65;
            if (proceduralRobot) proceduralRobot.scale.set(0.9, 0.9, 0.9);
        } else if (width < 1200) {
            // Tablet: compact right offset position
            camera.position.set(1.1, -0.2, 4.6);
            basePosY = -0.6;
            if (proceduralRobot) proceduralRobot.scale.set(1.0, 1.0, 1.0);
        } else {
            // Desktop: perfectly balanced right position (0% overlap with text)
            camera.position.set(1.4, -0.25, 4.2);
            basePosY = -0.55;
            if (proceduralRobot) proceduralRobot.scale.set(1.1, 1.1, 1.1);
        }
        camera.lookAt(0.2, -0.2, 0);
    }

    function createParticleAura() {
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 25 : 45; // Clean, minimal quantum dust
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x00f3ff);
        const color2 = new THREE.Color(0xbc13fe);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 5.0;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;

            const mixedColor = Math.random() > 0.5 ? color1 : color2;
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.055,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });

        particleAura = new THREE.Points(geometry, material);
        scene.add(particleAura);
    }

    function createUltraHighPolyRobot() {
        proceduralRobot = new THREE.Group();
        proceduralRobot.scale.set(1.1, 1.1, 1.1);

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        // ══════════════════════════════════════════
        // ULTRA-DETAILED DARK METALLIC PBR MATERIALS
        // ══════════════════════════════════════════
        const darkBodyMat = new THREE.MeshStandardMaterial({
            color: isLight ? 0x3b4252 : 0x181a24, // Premium Dark Metallic Gunmetal / Alloy
            metalness: 0.88, // HIGH METALLIC REFLECTION
            roughness: 0.22  // SMOOTH POLISHED METALLIC SHEEN
        });
        const darkMetalMat = new THREE.MeshStandardMaterial({
            color: 0x101117, // Deep Dark Titanium Slots & Mechanical Components
            metalness: 0.9,
            roughness: 0.2
        });
        emoPurpleMat = new THREE.MeshStandardMaterial({
            color: 0x5c34ab, // Deep Royal Purple (Headphones, Soles, Board Trim)
            metalness: 0.55,
            roughness: 0.25,
            emissive: 0x3b1c7a,
            emissiveIntensity: 0.38,
            side: THREE.DoubleSide
        });
        tealAccentMat = new THREE.MeshStandardMaterial({
            color: 0x00e5bf, // Vibrant Turquoise/Teal (Headphone Accent Rings & Stripes)
            metalness: 0.65,
            roughness: 0.2,
            emissive: 0x00b395,
            emissiveIntensity: 0.55,
            side: THREE.DoubleSide
        });
        const silverBezelMat = new THREE.MeshStandardMaterial({
            color: 0xd1d5db, // Curved Polished Metallic Light Silver Bezel Frame
            metalness: 0.95,
            roughness: 0.12
        });
        const visorScreenMat = new THREE.MeshStandardMaterial({
            color: 0x06070c, // Deep Glossy Dark Glass Visor Screen
            metalness: 0.95,
            roughness: 0.03
        });
        cyanEyesMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff, // Bright Neon Cyan Square LED Eyes
            emissive: 0x00f0ff,
            emissiveIntensity: 1.6,
            side: THREE.DoubleSide
        });
        const deckMat = new THREE.MeshStandardMaterial({
            color: 0x14151f, // Skateboard Polished Dark Metallic Deck
            metalness: 0.82,
            roughness: 0.25
        });
        const reactorCoreMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff, // Chest Sci-Fi Reactor Core
            emissive: 0x00f0ff,
            emissiveIntensity: 1.9,
            side: THREE.DoubleSide
        });
        const lensGlassMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // Camera Optical Blue Lens
            metalness: 0.92,
            roughness: 0.08
        });

        // ══════════════════════════════════════════
        // 1. EMO HOVERBOARD PLATFORM (WITH THRUSTERS, LIGHTS & PLASMA GLOW)
        // ══════════════════════════════════════════
        const boardGroup = new THREE.Group();

        // Skateboard Deck Shape (Rounded Oval with Curved Ends)
        const boardShape = new THREE.Shape();
        const bw = 0.62, bl = 1.7, br = 0.25;
        boardShape.moveTo(-bl/2 + br, -bw/2);
        boardShape.lineTo(bl/2 - br, -bw/2);
        boardShape.quadraticCurveTo(bl/2, -bw/2, bl/2, 0);
        boardShape.quadraticCurveTo(bl/2, bw/2, bl/2 - br, bw/2);
        boardShape.lineTo(-bl/2 + br, bw/2);
        boardShape.quadraticCurveTo(-bl/2, bw/2, -bl/2, 0);
        boardShape.quadraticCurveTo(-bl/2, -bw/2, -bl/2 + br, -bw/2);

        const boardGeo = new THREE.ExtrudeGeometry(boardShape, {
            depth: 0.075,
            bevelEnabled: true,
            bevelSegments: 5,
            steps: 1,
            bevelSize: 0.035,
            bevelThickness: 0.035
        });
        boardGeo.center();
        const boardMesh = new THREE.Mesh(boardGeo, deckMat);
        boardMesh.rotation.x = Math.PI / 2;
        boardGroup.add(boardMesh);

        // Deck Top Grip Texture Inset Pad
        const gripPadGeo = new THREE.PlaneGeometry(1.4, 0.48);
        const gripPad = new THREE.Mesh(gripPadGeo, darkMetalMat);
        gripPad.rotation.x = -Math.PI / 2;
        gripPad.position.set(0, 0.075, 0);
        boardGroup.add(gripPad);

        // Silver Deck Top Rim Rail
        const silverRimTorus = new THREE.TorusGeometry(0.76, 0.016, 16, 64);
        silverRimTorus.scale(1.15, 0.43, 1);
        const silverRim = new THREE.Mesh(silverRimTorus, silverBezelMat);
        silverRim.position.set(0, 0.035, 0);
        silverRim.rotation.x = Math.PI / 2;
        boardGroup.add(silverRim);

        // Skateboard Purple Bottom Glow Rim
        const edgeTorus = new THREE.TorusGeometry(0.75, 0.024, 16, 64);
        edgeTorus.scale(1.15, 0.42, 1);
        const edgeMesh = new THREE.Mesh(edgeTorus, emoPurpleMat);
        edgeMesh.position.set(0, -0.02, 0);
        edgeMesh.rotation.x = Math.PI / 2;
        boardGroup.add(edgeMesh);

        // Skateboard Base Pad / Stand Underneath
        const basePadGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.08, 32);
        basePadGeo.scale(1.4, 1, 0.45);
        const basePad = new THREE.Mesh(basePadGeo, darkBodyMat);
        basePad.position.set(0, -0.08, 0);
        boardGroup.add(basePad);

        // ── HOVER PLASMA UNDER-GLOW DISC ──
        const plasmaGeo = new THREE.CylinderGeometry(0.78, 0.82, 0.02, 32);
        const plasmaMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.9,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
        });
        const plasmaMesh = new THREE.Mesh(plasmaGeo, plasmaMat);
        plasmaMesh.position.set(0, -0.11, 0);
        boardGroup.add(plasmaMesh);

        // ── 4 CORNER HOVER THRUSTER DISCS ──
        const thrusterPositions = [
            [-0.55, -0.18], [0.55, -0.18],
            [-0.55, 0.18],  [0.55, 0.18]
        ];
        for (let pos of thrusterPositions) {
            const thrusterGroup = new THREE.Group();
            const ringHousing = new THREE.CylinderGeometry(0.08, 0.09, 0.04, 20);
            const housingMesh = new THREE.Mesh(ringHousing, darkMetalMat);
            thrusterGroup.add(housingMesh);

            const glowCore = new THREE.CylinderGeometry(0.055, 0.055, 0.05, 20);
            const glowMesh = new THREE.Mesh(glowCore, tealAccentMat);
            glowMesh.position.y = -0.01;
            thrusterGroup.add(glowMesh);

            thrusterGroup.position.set(pos[0], -0.08, pos[1]);
            boardGroup.add(thrusterGroup);
        }

        // ── FRONT & REAR DECK LIGHTS ──
        for (let side of [-1, 1]) {
            // Front Cyan Headlights
            const headLightGeo = new THREE.SphereGeometry(0.022, 12, 12);
            const headLight = new THREE.Mesh(headLightGeo, cyanEyesMat);
            headLight.position.set(0.78, 0.01, side * 0.12);
            boardGroup.add(headLight);

            // Rear Purple Tail Lights
            const tailLight = new THREE.Mesh(headLightGeo, emoPurpleMat);
            tailLight.position.set(-0.78, 0.01, side * 0.12);
            boardGroup.add(tailLight);
        }

        boardGroup.position.set(0, -0.92, 0);
        proceduralRobot.add(boardGroup);

        // ══════════════════════════════════════════
        // 2. CHUBBY EMO LEGS & BOOTS WITH PURPLE SOLES & SHIN LEDS
        // ══════════════════════════════════════════
        const legsGroup = new THREE.Group();

        for (let side of [-1, 1]) {
            const leg = new THREE.Group();

            // Hip Joint Ball
            const hipBallGeo = new THREE.SphereGeometry(0.085, 20, 20);
            const hipBall = new THREE.Mesh(hipBallGeo, silverBezelMat);
            hipBall.position.set(0, 0.42, 0);
            leg.add(hipBall);

            // Outer Thigh Frame
            const thighGeo = new THREE.BoxGeometry(0.18, 0.42, 0.22);
            const thigh = new THREE.Mesh(thighGeo, darkBodyMat);
            thigh.position.y = 0.21;
            leg.add(thigh);

            // Thigh Laser Line Accent (Embellishment!)
            const thighLaserGeo = new THREE.BoxGeometry(0.015, 0.24, 0.015);
            const thighLaser = new THREE.Mesh(thighLaserGeo, tealAccentMat);
            thighLaser.position.set(side * 0.095, 0.21, 0);
            leg.add(thighLaser);

            // Hollow Inner Leg Slot (Dark Accent)
            const slotGeo = new THREE.BoxGeometry(0.1, 0.28, 0.16);
            const slot = new THREE.Mesh(slotGeo, visorScreenMat);
            slot.position.set(0, 0.21, 0);
            leg.add(slot);

            // Shin Purple LED Capsule Light
            const capsuleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.09, 14);
            const capsuleMat = new THREE.MeshStandardMaterial({
                color: 0x8b5cf6,
                emissive: 0x8b5cf6,
                emissiveIntensity: 1.4
            });
            const capsuleMesh = new THREE.Mesh(capsuleGeo, capsuleMat);
            capsuleMesh.position.set(0, 0.12, 0.115);
            leg.add(capsuleMesh);

            // Metallic Capsule Bezel Ring
            const capBezelGeo = new THREE.TorusGeometry(0.018, 0.005, 12, 24);
            const capBezel = new THREE.Mesh(capBezelGeo, silverBezelMat);
            capBezel.position.set(0, 0.12, 0.115);
            leg.add(capBezel);

            // Ankle Joint Disc
            const jointGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.2, 24);
            const joint = new THREE.Mesh(jointGeo, darkBodyMat);
            joint.rotation.z = Math.PI / 2;
            joint.position.set(0, 0.02, 0);
            leg.add(joint);

            // Foot Boot Base
            const bootGeo = new THREE.BoxGeometry(0.24, 0.14, 0.34);
            const boot = new THREE.Mesh(bootGeo, darkBodyMat);
            boot.position.set(0, -0.07, 0.03);
            leg.add(boot);

            // Toe Cap Ridge
            const toeCapGeo = new THREE.BoxGeometry(0.245, 0.06, 0.12);
            const toeCap = new THREE.Mesh(toeCapGeo, darkMetalMat);
            toeCap.position.set(0, -0.1, 0.14);
            leg.add(toeCap);

            // Emo Purple Sole Rim (Matching the photo!)
            const soleGeo = new THREE.BoxGeometry(0.26, 0.038, 0.36);
            const sole = new THREE.Mesh(soleGeo, emoPurpleMat);
            sole.position.set(0, -0.14, 0.03);
            leg.add(sole);

            leg.position.set(side * 0.28, -0.74, 0);
            legsGroup.add(leg);
        }

        proceduralRobot.add(legsGroup);

        // ══════════════════════════════════════════
        // 3. COMPACT TORSO, CHEST REACTOR & SIDE ARMS
        // ══════════════════════════════════════════
        robotTorso = new THREE.Group();

        // Lower Pelvis Block
        const pelvisGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.18, 32);
        const pelvis = new THREE.Mesh(pelvisGeo, darkBodyMat);
        pelvis.position.y = -0.42;
        robotTorso.add(pelvis);

        // Main Body Shell
        const bodyGeo = new THREE.CylinderGeometry(0.38, 0.3, 0.42, 32);
        const bodyMesh = new THREE.Mesh(bodyGeo, darkBodyMat);
        bodyMesh.position.y = -0.22;
        robotTorso.add(bodyMesh);

        // Chest Armor Plate Cutout
        const chestPlateGeo = new THREE.CylinderGeometry(0.39, 0.35, 0.22, 32, 1, false, -Math.PI * 0.35, Math.PI * 0.7);
        const chestPlate = new THREE.Mesh(chestPlateGeo, darkMetalMat);
        chestPlate.position.y = -0.18;
        robotTorso.add(chestPlate);

        // VSH Chest Energy Core Light (Emblem Light)
        const coreRingGeo = new THREE.TorusGeometry(0.065, 0.012, 16, 32);
        const coreRing = new THREE.Mesh(coreRingGeo, silverBezelMat);
        coreRing.position.set(0, -0.18, 0.385);
        robotTorso.add(coreRing);

        const coreEmblemGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 24);
        const coreEmblem = new THREE.Mesh(coreEmblemGeo, reactorCoreMat);
        coreEmblem.rotation.x = Math.PI / 2;
        coreEmblem.position.set(0, -0.18, 0.39);
        robotTorso.add(coreEmblem);

        // ── SHORT SIDE ARMS, ENERGY CUFFS & HAND PODS ──
        for (let side of [-1, 1]) {
            const armGroup = new THREE.Group();
            
            // Shoulder Joint Sphere
            const shoulderGeo = new THREE.SphereGeometry(0.075, 20, 20);
            const shoulder = new THREE.Mesh(shoulderGeo, silverBezelMat);
            shoulder.position.set(side * 0.39, -0.15, 0);
            armGroup.add(shoulder);

            // Short Upper Arm Cylinder
            const armCylGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.18, 20);
            const armCyl = new THREE.Mesh(armCylGeo, darkBodyMat);
            armCyl.position.set(side * 0.44, -0.25, 0);
            armCyl.rotation.z = -side * 0.3;
            armGroup.add(armCyl);

            // Neon Energy Wrist Cuff Ring (Embellishment!)
            const cuffGeo = new THREE.TorusGeometry(0.058, 0.01, 16, 24);
            const cuffMesh = new THREE.Mesh(cuffGeo, tealAccentMat);
            cuffMesh.position.set(side * 0.46, -0.31, 0.03);
            cuffMesh.rotation.x = Math.PI / 2;
            armGroup.add(cuffMesh);

            // Rounded Magnetic Hand Pod
            const handGeo = new THREE.SphereGeometry(0.06, 20, 20);
            const hand = new THREE.Mesh(handGeo, darkMetalMat);
            hand.position.set(side * 0.48, -0.35, 0.05);
            armGroup.add(hand);

            if (side > 0) robotArmR = armGroup;
            else robotArmL = armGroup;

            robotTorso.add(armGroup);
        }

        // Neck Flexible Ribbed Rubber Bellows
        const neckBellowsGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.14, 32);
        const neckBellows = new THREE.Mesh(neckBellowsGeo, darkMetalMat);
        neckBellows.position.y = 0.01;
        robotTorso.add(neckBellows);

        // Metallic Top Collar Ring
        const neckCollarGeo = new THREE.TorusGeometry(0.16, 0.015, 16, 32);
        const neckCollar = new THREE.Mesh(neckCollarGeo, silverBezelMat);
        neckCollar.position.y = 0.07;
        neckCollar.rotation.x = Math.PI / 2;
        robotTorso.add(neckCollar);

        proceduralRobot.add(robotTorso);

        // ══════════════════════════════════════════
        // 4. DETAILED EMO ROBOT HEAD & HEADPHONES (CURSOR TRACKED)
        // ══════════════════════════════════════════
        robotHead = new THREE.Group();

        // Main Helmet Head Shell (Subdivided Smooth Sphere scaled to TV Head shape)
        const headGeo = new THREE.SphereGeometry(0.54, 64, 64);
        headGeo.scale(1.16, 0.98, 0.96);
        const headMesh = new THREE.Mesh(headGeo, darkBodyMat);
        robotHead.add(headMesh);

        // Crown Neon Laser Accent Stripes on Forehead (Embellishment!)
        for (let side of [-1, 1]) {
            const crownLaserGeo = new THREE.TorusGeometry(0.542, 0.008, 12, 32, Math.PI * 0.16);
            const crownLaser = new THREE.Mesh(crownLaserGeo, cyanEyesMat);
            crownLaser.rotation.x = Math.PI * 0.28;
            crownLaser.rotation.y = side * Math.PI * 0.14;
            robotHead.add(crownLaser);
        }

        // Metallic Silver-Grey Screen Bezel Frame
        const bezelGeo = new THREE.SphereGeometry(0.51, 48, 48);
        bezelGeo.scale(1.1, 0.94, 0.42);
        const bezelMesh = new THREE.Mesh(bezelGeo, silverBezelMat);
        bezelMesh.position.set(0, 0, 0.31);
        robotHead.add(bezelMesh);

        // Inner Bezel Metallic Step Ring
        const bezelStepGeo = new THREE.SphereGeometry(0.5, 48, 48);
        bezelStepGeo.scale(1.07, 0.92, 0.39);
        const bezelStep = new THREE.Mesh(bezelStepGeo, darkMetalMat);
        bezelStep.position.set(0, 0, 0.32);
        robotHead.add(bezelStep);

        // Dark Visor Glass Screen
        const screenGeo = new THREE.SphereGeometry(0.49, 48, 48);
        screenGeo.scale(1.05, 0.9, 0.36);
        const screenMesh = new THREE.Mesh(screenGeo, visorScreenMat);
        screenMesh.position.set(0, 0, 0.34);
        robotHead.add(screenMesh);

        // ── DUAL CAMERA OPTICAL SENSOR LENS ──
        const camRingGeo = new THREE.TorusGeometry(0.042, 0.008, 16, 24);
        const camRing = new THREE.Mesh(camRingGeo, silverBezelMat);
        camRing.position.set(0, 0.39, 0.44);
        robotHead.add(camRing);

        const camLensGeo = new THREE.SphereGeometry(0.038, 16, 16);
        const camLens = new THREE.Mesh(camLensGeo, lensGlassMat);
        camLens.position.set(0, 0.39, 0.435);
        robotHead.add(camLens);

        // ── CHIN SPEAKER MICRO-GRILLE SLOTS ──
        for (let offset of [-0.06, 0, 0.06]) {
            const slitGeo = new THREE.BoxGeometry(0.04, 0.008, 0.02);
            const slit = new THREE.Mesh(slitGeo, darkMetalMat);
            slit.position.set(offset, -0.34, 0.46);
            robotHead.add(slit);
        }

        // ── EMO BRIGHT CYAN SQUARE LED EYES ──
        const eyeShape = new THREE.Shape();
        const es = 0.095, er = 0.028;
        eyeShape.moveTo(-es+er, -es);
        eyeShape.lineTo(es-er, -es);
        eyeShape.quadraticCurveTo(es, -es, es, -es+er);
        eyeShape.lineTo(es, es-er);
        eyeShape.quadraticCurveTo(es, es, es-er, es);
        eyeShape.lineTo(-es+er, es);
        eyeShape.quadraticCurveTo(-es, es, -es, es-er);
        eyeShape.lineTo(-es, -es+er);
        eyeShape.quadraticCurveTo(-es, -es, -es+er, -es);

        const eyeExtrude = { depth: 0.02, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3 };
        const eyeGeo = new THREE.ExtrudeGeometry(eyeShape, eyeExtrude);
        eyeGeo.center();

        eyeLMesh = new THREE.Mesh(eyeGeo, cyanEyesMat);
        eyeLMesh.position.set(-0.21, 0.03, 0.49);
        eyeLMesh.scale.set(1.15, 1.15, 1.15);

        eyeRMesh = new THREE.Mesh(eyeGeo, cyanEyesMat);
        eyeRMesh.position.set(0.21, 0.03, 0.49);
        eyeRMesh.scale.set(1.15, 1.15, 1.15);

        robotHead.add(eyeLMesh);
        robotHead.add(eyeRMesh);

        // ── EMO PURPLE HEADPHONES WITH TEAL ACCENTS & PADDING ──
        const headphoneGroup = new THREE.Group();

        // Inner Headband Cushion Pad Strip
        const cushionGeo = new THREE.TorusGeometry(0.635, 0.035, 16, 48, Math.PI * 0.85);
        const cushionMesh = new THREE.Mesh(cushionGeo, darkMetalMat);
        cushionMesh.rotation.z = Math.PI * 0.075;
        headphoneGroup.add(cushionMesh);

        // Deep Purple Headband Arch over Head
        const headbandGeo = new THREE.TorusGeometry(0.66, 0.052, 24, 64, Math.PI);
        const headbandMesh = new THREE.Mesh(headbandGeo, emoPurpleMat);
        headbandMesh.rotation.z = 0;
        headphoneGroup.add(headbandMesh);

        // Turquoise/Teal Accent Stripes on Top of Headband
        for (let side of [-1, 1]) {
            const stripeGeo = new THREE.TorusGeometry(0.67, 0.024, 16, 32, Math.PI * 0.18);
            const stripeMesh = new THREE.Mesh(stripeGeo, tealAccentMat);
            stripeMesh.rotation.z = side > 0 ? Math.PI * 0.41 : Math.PI * 0.41;
            stripeMesh.position.x = side * 0.32;
            headphoneGroup.add(stripeMesh);
        }

        // Side Antenna Signal Tip Light (Right Headphone Node)
        const antennaStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.12, 12);
        const antennaStem = new THREE.Mesh(antennaStemGeo, silverBezelMat);
        antennaStem.position.set(0.58, 0.42, 0);
        antennaStem.rotation.z = -Math.PI * 0.2;
        headphoneGroup.add(antennaStem);

        const antennaTipGeo = new THREE.SphereGeometry(0.025, 12, 12);
        const antennaTip = new THREE.Mesh(antennaTipGeo, cyanEyesMat);
        antennaTip.position.set(0.63, 0.47, 0);
        headphoneGroup.add(antennaTip);

        // Side Earcups (Deep Purple Shell + Silver Rim + Turquoise Inner Ring + Teal Core)
        for (let side of [-1, 1]) {
            const earcup = new THREE.Group();

            // Main Purple Outer Shell
            const cupGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 32);
            const cupMesh = new THREE.Mesh(cupGeo, emoPurpleMat);
            cupMesh.rotation.z = Math.PI / 2;
            earcup.add(cupMesh);

            // Silver Outer Bevel Rim
            const silverCupRim = new THREE.TorusGeometry(0.215, 0.012, 16, 32);
            const silverCupMesh = new THREE.Mesh(silverCupRim, silverBezelMat);
            silverCupMesh.rotation.y = Math.PI / 2;
            silverCupMesh.position.x = side * 0.02;
            earcup.add(silverCupMesh);

            // Turquoise/Teal Inner Accent Ring
            const ringGeo = new THREE.TorusGeometry(0.17, 0.024, 16, 32);
            const ringMesh = new THREE.Mesh(ringGeo, tealAccentMat);
            ringMesh.rotation.y = Math.PI / 2;
            ringMesh.position.x = side * 0.04;
            earcup.add(ringMesh);

            // Recessed Inner Dark Chamber Disc
            const darkDiscGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.03, 24);
            const darkDisc = new THREE.Mesh(darkDiscGeo, darkMetalMat);
            darkDisc.rotation.z = Math.PI / 2;
            darkDisc.position.x = side * 0.055;
            earcup.add(darkDisc);

            // Deep Purple Center Plate
            const centerDiscGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.04, 24);
            const centerDisc = new THREE.Mesh(centerDiscGeo, emoPurpleMat);
            centerDisc.rotation.z = Math.PI / 2;
            centerDisc.position.x = side * 0.065;
            earcup.add(centerDisc);

            // Teal Center Dot Button
            const dotGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.05, 20);
            const dotMesh = new THREE.Mesh(dotGeo, tealAccentMat);
            dotMesh.rotation.z = Math.PI / 2;
            dotMesh.position.x = side * 0.075;
            earcup.add(dotMesh);

            earcup.position.set(side * 0.65, 0.02, 0);
            headphoneGroup.add(earcup);
        }

        robotHead.add(headphoneGroup);

        robotHead.position.set(0, 0.28, 0);
        proceduralRobot.add(robotHead);

        robotGroup.add(proceduralRobot);
    }

    function onMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    function loadGLBRobot() {
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.warn('GLTFLoader not found, using procedural model');
            return;
        }

        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/robot.glb',
            function (gltf) {
                const model = gltf.scene;

                // Traverse and optimize materials / lighting
                model.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                            child.material.metalness = Math.min(child.material.metalness || 0.7, 0.95);
                            child.material.roughness = Math.max(child.material.roughness || 0.2, 0.12);
                            child.material.needsUpdate = true;
                        }
                    }
                });

                // Compute Bounding Box & Center Pivot
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                // Center model inside pivot group
                model.position.set(-center.x, -center.y, -center.z);

                glbRobot = new THREE.Group();
                glbRobot.add(model);

                // Auto-scale to standard visible height ~2.4 units
                const maxDim = Math.max(size.x, size.y, size.z);
                const scaleFactor = 2.4 / (maxDim || 1);
                glbRobot.scale.set(scaleFactor, scaleFactor, scaleFactor);

                // Hide procedural fallback and display loaded GLB robot
                if (proceduralRobot) {
                    proceduralRobot.visible = false;
                }

                robotGroup.add(glbRobot);
                console.log('✅ Futuristic 3D Robot GLB loaded successfully');
            },
            undefined,
            function (error) {
                console.warn('Could not load assets/robot.glb, keeping procedural robot fallback:', error);
            }
        );
    }

    function onMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    function onTouchMove(e) {
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
        }
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        updateCameraPosition();
    }

    function updateLightingForTheme() {
        if (!ambientLight || !mainLight) return;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            ambientLight.intensity = 0.65;
            mainLight.intensity = 1.9;
            mainLight.color.setHex(0xffffff);
            fillLight.color.setHex(0x38bdf8);
        } else {
            ambientLight.intensity = 0.55;
            mainLight.intensity = 1.8;
            mainLight.color.setHex(0xfff5ea);
            fillLight.color.setHex(0x38bdf8);
        }
    }

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // 1. LINEAR INTERPOLATION (LERP) FOR CURSOR TRACKING
        targetRotY = mouseX * 0.88;  // Extended rotation angle (~50 deg)
        targetRotX = -mouseY * 0.52; // Extended vertical angle (~30 deg)

        currentRotY += (targetRotY - currentRotY) * 0.06;
        currentRotX += (targetRotX - currentRotX) * 0.06;

        // GLB Robot cursor reaction & tilt
        if (glbRobot) {
            glbRobot.rotation.y = currentRotY * 0.95;
            glbRobot.rotation.x = currentRotX * 0.45;
            glbRobot.rotation.z = Math.sin(time * 1.2) * 0.025;
        }

        // 2. CURSOR REACTION & BLINKING ANIMATION (Procedural fallback)
        const blinkCycle = time % 4.5;
        const isBlinking = blinkCycle > 4.35;
        const targetEyeScaleY = isBlinking ? 0.08 : 1.15;
        if (eyeLMesh) eyeLMesh.scale.y += (targetEyeScaleY - eyeLMesh.scale.y) * 0.4;
        if (eyeRMesh) eyeRMesh.scale.y += (targetEyeScaleY - eyeRMesh.scale.y) * 0.4;

        // Emissive Eye Glow & Cursor Sensitivity
        if (cyanEyesMat) {
            const cursorDist = Math.hypot(mouseX, mouseY);
            cyanEyesMat.emissiveIntensity = 1.35 + Math.sin(time * 3.5) * 0.25 + cursorDist * 0.45;
        }

        // Headphones & Sole Emissive Pulse
        if (emoPurpleMat) {
            emoPurpleMat.emissiveIntensity = 0.32 + Math.sin(time * 2.2) * 0.12;
        }
        if (tealAccentMat) {
            tealAccentMat.emissiveIntensity = 0.48 + Math.sin(time * 3.0) * 0.22;
        }

        // 3. HEAD TILTING, BOBBING & BODY BREATHING MOTION
        if (robotHead) {
            robotHead.rotation.y = currentRotY;
            robotHead.rotation.x = currentRotX;
            robotHead.rotation.z = Math.sin(time * 1.4) * 0.035; // Soft head tilt
        }

        if (robotTorso) {
            robotTorso.rotation.y = currentRotY * 0.28;
            robotTorso.rotation.x = currentRotX * 0.18;
            const breath = 1 + Math.sin(time * 2.2) * 0.012;
            robotTorso.scale.set(breath, breath, breath);
            if (robotArmR) robotArmR.rotation.z = Math.sin(time * 2) * 0.05 + currentRotX * 0.1;
            if (robotArmL) robotArmL.rotation.z = -Math.sin(time * 2) * 0.05 - currentRotX * 0.1;
        }

        // 4. IDLE FLOATING HOVER & BREATHING ANIMATION
        if (robotGroup) {
            robotGroup.position.y = basePosY + Math.sin(time * 1.5) * 0.12;
            robotGroup.rotation.z = Math.sin(time * 0.9) * 0.03;
        }

        // 5. ANIMATE PARTICLE NEBULA AURA
        if (particleAura) {
            particleAura.rotation.y = time * 0.06;
            particleAura.rotation.x = Math.sin(time * 0.04) * 0.12;
        }

        // 6. RENDER SCENE
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3DRobot);
    } else {
        init3DRobot();
    }
})();
