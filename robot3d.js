/**
 * AshyqLab — Interactive 3D Cyber Robot Background Engine
 * Exclusively loads and renders the dedicated 3D GLB Robot model with smooth cursor tracking, studio lighting & particle nebula.
 */

(function () {
    let scene, camera, renderer;
    let robotGroup = null;
    let glbRobot = null;
    let particleAura = null;

    // Mouse tracking & LERP variables
    let mouseX = 0, mouseY = 0;
    let targetRotY = 0, targetRotX = 0;
    let currentRotY = 0, currentRotX = 0;
    let basePosY = -0.45;

    // Lighting references
    let ambientLight, mainLight, fillLight, rimLight, pointGlow;

    function init3DRobot() {
        const canvas = document.getElementById('robot-canvas');
        if (!canvas) return;

        // 1. THREE.JS SCENE SETUP
        scene = new THREE.Scene();

        // 2. PERSPECTIVE CAMERA
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

        // 3. HIGH-PERFORMANCE WEBGL RENDERER
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

        updateCameraPosition();

        // 4. STUDIO-GRADE LIGHTING SETUP
        ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        scene.add(ambientLight);

        mainLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
        mainLight.position.set(6, 10, 7);
        scene.add(mainLight);

        fillLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
        fillLight.position.set(-6, 4, -3);
        scene.add(fillLight);

        rimLight = new THREE.DirectionalLight(0xa855f7, 0.95);
        rimLight.position.set(0, 8, -5);
        scene.add(rimLight);

        pointGlow = new THREE.PointLight(0x00f3ff, 1.2, 10);
        pointGlow.position.set(2, -1, 2);
        scene.add(pointGlow);

        // Root Robot Group
        robotGroup = new THREE.Group();
        scene.add(robotGroup);

        // 5. CREATE FLOATING PARTICLE NEBULA
        createParticleAura();

        // 6. LOAD DEDICATED 3D ROBOT GLB
        loadGLBRobot();

        // 7. EVENT LISTENERS
        window.addEventListener('mousemove', onMouseMove, { passive: true });
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
            camera.position.set(0, -0.1, 5.2);
            basePosY = -0.65;
        } else if (width < 1200) {
            camera.position.set(1.1, -0.2, 4.6);
            basePosY = -0.6;
        } else {
            camera.position.set(1.4, -0.25, 4.2);
            basePosY = -0.55;
        }
        camera.lookAt(0.2, -0.2, 0);
    }

    function createParticleAura() {
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 25 : 45;
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

    function loadGLBRobot() {
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.warn('GLTFLoader not found');
            window.dispatchEvent(new CustomEvent('ashyqlab:robot-loaded', { detail: { success: false } }));
            return;
        }

        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/robot.glb',
            function (gltf) {
                const model = gltf.scene;

                // Traverse and optimize materials
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

                robotGroup.add(glbRobot);
                console.log('✅ Futuristic 3D Robot GLB loaded successfully');

                window.ashyqLabRobotLoaded = true;
                window.dispatchEvent(new CustomEvent('ashyqlab:robot-loaded', { detail: { success: true } }));
            },
            function (xhr) {
                if (xhr.total && xhr.total > 0) {
                    const pct = Math.round((xhr.loaded / xhr.total) * 100);
                    window.dispatchEvent(new CustomEvent('ashyqlab:robot-progress', { detail: { percent: pct } }));
                }
            },
            function (error) {
                console.warn('Could not load assets/robot.glb:', error);
                window.dispatchEvent(new CustomEvent('ashyqlab:robot-loaded', { detail: { success: false } }));
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

        // Linear interpolation (LERP) for cursor tracking
        targetRotY = mouseX * 0.88;
        targetRotX = -mouseY * 0.52;

        currentRotY += (targetRotY - currentRotY) * 0.06;
        currentRotX += (targetRotX - currentRotX) * 0.06;

        // GLB Robot cursor reaction & tilt
        if (glbRobot) {
            glbRobot.rotation.y = currentRotY * 0.95;
            glbRobot.rotation.x = currentRotX * 0.45;
            glbRobot.rotation.z = Math.sin(time * 1.2) * 0.025;
        }

        // Idle floating hover & breathing animation
        if (robotGroup) {
            robotGroup.position.y = basePosY + Math.sin(time * 1.5) * 0.12;
            robotGroup.rotation.z = Math.sin(time * 0.9) * 0.03;
        }

        // Animate particle nebula
        if (particleAura) {
            particleAura.rotation.y = time * 0.06;
            particleAura.rotation.x = Math.sin(time * 0.04) * 0.12;
        }

        // Render scene
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
