
        // --- SAFE DOM BINDING HELPER ---
        const safeBind = (id, event, callback) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, callback);
        };

        // --- DATA ---
        const slides = [
            { phase: "01 // IMMERSIVE PROPTECH", title: "Tech Meets Heritage", subtitle: "Garuda Spark Innovation Hub MCC", desc: "A 245sqm interactive blueprint. Experience real-time architectural visualisation, modular cost-estimation, and spatial analysis in a fully immersive 3D environment.", pos: [22, 28, 22], lookAt: [0, 0, 0], focus: "all" },
            { phase: "02 // PARAMETRIC DESIGN", title: "Fjäll EPS Architecture", subtitle: "Acoustic Meeting Rooms", desc: "Review the meeting room envelope within the existing MCC space. Coordinate acoustic separation, support conditions and interfaces through project-specific design and engineering.", pos: [-16, 12, 16], lookAt: [-5.5, 1, 4.5], focus: "eps" },
            { phase: "03 // DYNAMIC ZONING", title: "Fluid Collaboration", subtitle: "Communal Space & Offices", desc: "Test different layout configurations instantly. Premium 12mm cast acrylic partitions rendered with accurate physics-based light transmission.", pos: [0, 16, -18], lookAt: [-2, 1, -3], focus: "glass" },
            { phase: "04 // DIGITAL TWIN", title: "The Golden Anchor", subtitle: "Parametric Garuda", desc: "Fusing ancient proportions with kinetic engineering. A central light-refracting anchor acting as a digital twin for the main lobby.", pos: [14, 8, 16], lookAt: [0, 2, 4], focus: "artifact" },
            { phase: "05 // MATERIAL SIMULATION", title: "GX-100 Panel", subtitle: "Simulation Game Studio", desc: "Explore the documented nine-layer GX-100 build-up: an EPS core with PU glue, fibreglass mesh, Kalci board and a finish on each face. Concept illustration, not to scale; final specification is project-specific.", pos: [-3, 6, -1], lookAt: [-5.5, 1.5, -6.5], focus: "studio" }
        ];

        // --- GLOBAL STATE ---
        let currentSlideIndex = 0;
        let isVrMode = false;
        let isTransitioning = false;
        let isLoaded = false;
        let cinematicPhase = 0; 
        
        let cameraMode = 0; 
        let targetFov = 32;
        let isAnalyzing = false;
        
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        const vrState = {
            active: false, locked: false, pitch: 0, yaw: 0,
            fwd: false, bwd: false, lft: false, rgt: false, sprint: false,
            velocity: null, direction: null, joystickMove: null,
            bobTimer: 0
        };

        let scene, camera, renderer, clock, playerPos;
        let epsGroup, glassGroup, furnitureGroup, artifactGroup, panelGroup;
        let gxLayers = [];
        let garudaLight, studioLight, coreObj, ring1, ring2;
        let targetPos, targetLook, currentLook;
        let isThreeSetupComplete = false;

        const gamePOIs = [
            { title: "Acoustic Meeting Room", triggered: false, rawPos: [-5.5, 0, 4.5], pos: null },
            { title: "Communal Workspace", triggered: false, rawPos: [-4.5, 0, -1.5], pos: null },
            { title: "Executive Office", triggered: false, rawPos: [4.5, 0, -5.5], pos: null },
            { title: "Garuda Artifact", triggered: false, rawPos: [0, 0, 7.9], pos: null },
            { title: "Fjäll EPS Simulator", triggered: false, rawPos: [-5.5, 0, -6.5], pos: null }
        ];

        // --- UI DOM UPDATES ---
        function updateUIText() {
            const slide = slides[currentSlideIndex];
            
            const ph = document.getElementById('slide-phase'); if (ph) ph.innerText = slide.phase;
            const ti = document.getElementById('slide-title'); if (ti) ti.innerText = slide.title;
            const su = document.getElementById('slide-subtitle'); if (su) su.innerText = slide.subtitle;
            const de = document.getElementById('slide-desc'); if (de) de.innerText = slide.desc;
            const nt = document.getElementById('btn-next-text'); if (nt) nt.innerText = currentSlideIndex === slides.length - 1 ? 'Restart Briefing' : 'Next Insight';

            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                if (index === currentSlideIndex) {
                    dot.classList.add('dot-active');
                    dot.classList.remove('dot-inactive', 'hover:bg-black/20');
                } else {
                    dot.classList.remove('dot-active');
                    dot.classList.add('dot-inactive', 'hover:bg-black/20');
                }
            });
        }

        function goToSlide(index) {
            if (isTransitioning || index === currentSlideIndex) return;
            isTransitioning = true;
            
            const slideContent = document.getElementById('slide-content');
            if(slideContent) {
                slideContent.classList.remove('show-ui');
                slideContent.classList.add('hide-ui');
            }

            setTimeout(() => {
                currentSlideIndex = index;
                updateUIText();
                if(slideContent) {
                    slideContent.classList.remove('hide-ui');
                    slideContent.classList.add('show-ui');
                }
                isTransitioning = false;
            }, 300);
        }

        // Base UI Binds
        safeBind('btn-next', 'click', () => goToSlide((currentSlideIndex + 1) % slides.length));
        safeBind('btn-prev', 'click', () => goToSlide((currentSlideIndex - 1 + slides.length) % slides.length));
        
        const dotsList = document.querySelectorAll('.dot');
        dotsList.forEach(dot => dot.addEventListener('click', (e) => goToSlide(parseInt(e.target.dataset.index))));

        // --- MATERIAL ANALYSIS LOGIC ---
        function toggleMaterialAnalysis() {
            isAnalyzing = !isAnalyzing;
            const matModal = document.getElementById('material-modal');
            const matModalContent = document.getElementById('mat-modal-content');
            
            if (isAnalyzing) {
                if(matModal) matModal.classList.remove('opacity-0', 'pointer-events-none');
                if(matModalContent) {
                    matModalContent.classList.remove('translate-x-full');
                    matModalContent.classList.add('pointer-events-auto');
                }
                
                if (isTouchDevice) {
                    const joy = document.getElementById('mobile-joystick');
                    if(joy) joy.classList.replace('flex', 'hidden');
                    if (vrState.joystickMove) vrState.joystickMove.set(0, 0);
                } else if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
            } else {
                if(matModal) matModal.classList.add('opacity-0', 'pointer-events-none');
                if(matModalContent) {
                    matModalContent.classList.add('translate-x-full');
                    matModalContent.classList.remove('pointer-events-auto');
                }
                
                if (isTouchDevice && isVrMode) {
                    const joy = document.getElementById('mobile-joystick');
                    if(joy) joy.classList.replace('hidden', 'flex');
                } else if (!isTouchDevice && isVrMode) {
                    const canvas = document.getElementById('glcanvas');
                    if(canvas) canvas.requestPointerLock();
                }
            }
        }
        
        safeBind('mat-modal-bg', 'click', () => { if(isAnalyzing) toggleMaterialAnalysis(); });
        safeBind('btn-close-mat', 'click', () => { if(isAnalyzing) toggleMaterialAnalysis(); });

        // --- VR ENTRY/EXIT LOGIC ---
        function toggleVRMode() {
            isVrMode = !isVrMode;
            vrState.active = isVrMode;
            
            const mainUi = document.getElementById('main-ui');
            const vrUi = document.getElementById('vr-ui');
            const canvasContainer = document.getElementById('canvas-container');
            const canvas = document.getElementById('glcanvas');
            const mobActions = document.getElementById('mobile-actions');
            const joystick = document.getElementById('mobile-joystick');

            if (isVrMode) {
                if (mainUi) {
                    mainUi.style.opacity = '0';
                    mainUi.style.pointerEvents = 'none'; 
                }
                if (vrUi) vrUi.classList.replace('hidden', 'flex');

                if (isTouchDevice) {
                    if (canvasContainer) canvasContainer.classList.replace('cursor-move', 'cursor-auto');
                    if (joystick) joystick.classList.replace('hidden', 'flex');
                    if (mobActions) mobActions.classList.replace('hidden', 'flex');
                } else {
                    if (canvasContainer) canvasContainer.classList.replace('cursor-move', 'cursor-crosshair');
                    if (isThreeSetupComplete && canvas) canvas.requestPointerLock();
                }
            } else {
                if (isLoaded && mainUi) {
                    mainUi.style.opacity = '1';
                    mainUi.style.pointerEvents = ''; 
                }
                if (vrUi) vrUi.classList.replace('flex', 'hidden');
                if (isAnalyzing) toggleMaterialAnalysis();

                if (isTouchDevice) {
                    if (canvasContainer) canvasContainer.classList.replace('cursor-auto', 'cursor-move');
                    if (joystick) joystick.classList.replace('flex', 'hidden');
                    if (mobActions) mobActions.classList.replace('flex', 'hidden');
                    if (vrState.joystickMove) vrState.joystickMove.set(0, 0); 
                } else {
                    if (canvasContainer) canvasContainer.classList.replace('cursor-crosshair', 'cursor-move');
                    if (document.pointerLockElement === canvas) document.exitPointerLock();
                }
                cameraMode = 0;
                targetFov = 32;
            }
        }
        
        safeBind('btn-enter-vr', 'click', toggleVRMode);
        safeBind('btn-exit-vr', 'click', toggleVRMode);
        safeBind('btn-exit-vr-mob', 'touchstart', (e) => { e.preventDefault(); toggleVRMode(); });

        safeBind('canvas-container', 'click', () => { 
            const canvas = document.getElementById('glcanvas');
            if (isVrMode && !isTouchDevice && isThreeSetupComplete && !isAnalyzing && canvas) {
                canvas.requestPointerLock(); 
            }
        });

        // --- MOBILE ACTION BINDS ---
        safeBind('btn-mob-zoom-in', 'touchstart', (e) => { e.preventDefault(); targetFov = Math.max(15, targetFov - 10); });
        safeBind('btn-mob-zoom-out', 'touchstart', (e) => { e.preventDefault(); targetFov = Math.min(75, targetFov + 10); });
        safeBind('btn-mob-cam', 'touchstart', (e) => { e.preventDefault(); cameraMode = (cameraMode + 1) % 3; });
        safeBind('btn-mob-analyze', 'touchstart', (e) => { e.preventDefault(); toggleMaterialAnalysis(); });

        updateUIText(); 

        // --- STRICTLY SANDBOXED 3D INITIALIZATION ---
        function init3D() {
            if (typeof THREE === 'undefined') return false;

            try {
                // Initialize Vectors safely
                vrState.velocity = new THREE.Vector3();
                vrState.direction = new THREE.Vector3();
                vrState.joystickMove = new THREE.Vector2();
                targetPos = new THREE.Vector3();
                targetLook = new THREE.Vector3();
                currentLook = new THREE.Vector3(0, 0, 0);
                playerPos = new THREE.Vector3(0, 0, 0);
                clock = new THREE.Clock();

                gamePOIs.forEach(poi => {
                    poi.pos = new THREE.Vector3(poi.rawPos[0], poi.rawPos[1], poi.rawPos[2]);
                });

                scene = new THREE.Scene();
                scene.background = new THREE.Color('#f4f4f5'); 
                scene.fog = new THREE.FogExp2('#f4f4f5', 0.015); 

                camera = new THREE.PerspectiveCamera(targetFov, window.innerWidth / window.innerHeight, 0.1, 150);
                camera.rotation.order = 'YXZ'; 
                camera.position.set(0, 55, 0.1); 

                const canvas = document.getElementById('glcanvas');
                renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
                renderer.outputColorSpace = THREE.SRGBColorSpace;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.15; 

                // Lighting
                scene.add(new THREE.AmbientLight(0xffffff, 0.4)); 
                const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.5); 
                keyLight.position.set(15, 30, 15);
                keyLight.castShadow = true;
                keyLight.shadow.mapSize.width = 2048;
                keyLight.shadow.mapSize.height = 2048;
                keyLight.shadow.bias = -0.0001;
                scene.add(keyLight);
                
                const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.2); 
                fillLight.position.set(-20, 10, -20);
                scene.add(fillLight);

                const createZoneLight = (colour, intensity, x, y, z) => {
                    const light = new THREE.PointLight(colour, intensity, 15);
                    light.position.set(x, y, z);
                    scene.add(light);
                };
                createZoneLight(0xffaa00, 1.5, -5.5, 3.0, 4.5);
                createZoneLight(0x00aaff, 1.5, 4.5, 3.0, -5.5);
                createZoneLight(0x54d2b2, 1.5, -4.5, 3.0, -1.5);
                createZoneLight(0xeab308, 1.5, 0, 3.5, 4.0);

                // Materials
                const floorMat = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc, roughness: 0.1, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.15 }); 
                const wallEpsMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0.05, clearcoat: 0.1 }); 
                const darkWallMat = new THREE.MeshPhysicalMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.4, clearcoat: 0.3 }); 
                const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.0, transmission: 1.0, thickness: 0.5, ior: 1.52, clearcoat: 1.0, transparent: true });
                const deskMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.05 }); 
                const woodMat = new THREE.MeshPhysicalMaterial({ color: 0xd4a373, roughness: 0.4, metalness: 0.0, clearcoat: 0.5 }); 
                const accentMat = new THREE.MeshPhysicalMaterial({ color: 0xeab308, roughness: 0.15, metalness: 1.0, clearcoat: 1.0 }); 
                const seatGreyMat = new THREE.MeshPhysicalMaterial({ color: 0x64748b, roughness: 0.8, metalness: 0.1 }); 

                const finishMat = new THREE.MeshPhysicalMaterial({ color: 0xe9e2d5, metalness: 0, roughness: 0.85 });
                const boardMat = new THREE.MeshPhysicalMaterial({ color: 0x94a3a0, metalness: 0, roughness: 0.95 });
                const meshMat = new THREE.MeshPhysicalMaterial({ color: 0xd9cfad, metalness: 0, roughness: 1 });
                const adhesiveMat = new THREE.MeshPhysicalMaterial({ color: 0xd97706, metalness: 0.1, roughness: 0.9, transmission: 0.3, transparent: true, opacity: 0.9 });
                const epsCoreMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 1.0, metalness: 0.0, clearcoat: 0.0, transmission: 0.25, ior: 1.1, transparent: true });
                const pedestalMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3, clearcoat: 1.0 });

                // Hierarchy
                diorama = new THREE.Group(); diorama.position.set(0, -2, 0); scene.add(diorama);
                epsGroup = new THREE.Group(); diorama.add(epsGroup);
                glassGroup = new THREE.Group(); diorama.add(glassGroup);
                furnitureGroup = new THREE.Group(); diorama.add(furnitureGroup);
                const baseGroup = new THREE.Group(); diorama.add(baseGroup);
                artifactGroup = new THREE.Group(); artifactGroup.position.set(0, 2.5, 4.0); diorama.add(artifactGroup);
                
                studioGroup = new THREE.Group(); studioGroup.position.set(-5.5, 0.0, -6.5); diorama.add(studioGroup);
                panelGroup = new THREE.Group(); panelGroup.position.set(0, 1.8, 0); studioGroup.add(panelGroup);

                const floorLayer = new THREE.Mesh(new THREE.PlaneGeometry(15, 16.3), floorMat);
                floorLayer.rotation.x = -Math.PI / 2; floorLayer.receiveShadow = true; 
                baseGroup.add(floorLayer);
                
                const gridHelper = new THREE.GridHelper(20, 20, 0xe2e8f0, 0xf1f5f9); 
                gridHelper.position.y = 0.01;
                baseGroup.add(gridHelper);

                const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: 0.15 })); 
                shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = -0.01; shadowPlane.receiveShadow = true;
                baseGroup.add(shadowPlane);

                // Internal Builder Helpers
                const addMesh = (geo, mat, x, y, z, group, cast = true) => {
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(x, y, z);
                    mesh.castShadow = cast; mesh.receiveShadow = true;
                    group.add(mesh);
                    return mesh;
                };

                const addTable = (w, d, x, z, group) => {
                    addMesh(new THREE.BoxGeometry(w, 0.05, d), deskMat, x, 0.75, z, group);
                    addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8), darkWallMat, x - w/2 + 0.1, 0.375, z - d/2 + 0.1, group);
                    addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8), darkWallMat, x + w/2 - 0.1, 0.375, z - d/2 + 0.1, group);
                    addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8), darkWallMat, x - w/2 + 0.1, 0.375, z + d/2 - 0.1, group);
                    addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8), darkWallMat, x + w/2 - 0.1, 0.375, z + d/2 - 0.1, group);
                };

                const addChair = (x, z, angle, group) => {
                    const chairGrp = new THREE.Group();
                    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), seatGreyMat); seat.position.y = 0.45; seat.castShadow = true; chairGrp.add(seat);
                    const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.05), seatGreyMat); back.position.set(0, 0.65, -0.18); back.castShadow = true; chairGrp.add(back);
                    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), darkWallMat); leg.position.y = 0.225; chairGrp.add(leg);
                    chairGrp.position.set(x, 0, z); chairGrp.rotation.y = angle;
                    group.add(chairGrp);
                };

                // Add Architecture
                addMesh(new THREE.BoxGeometry(15, 0.5, 0.2), darkWallMat, 0, 0.25, -8.15, baseGroup); 
                addMesh(new THREE.BoxGeometry(15, 0.5, 0.2), darkWallMat, 0, 0.25, 8.15, baseGroup);  
                addMesh(new THREE.BoxGeometry(0.2, 0.5, 16.3), darkWallMat, -7.5, 0.25, 0, baseGroup); 
                addMesh(new THREE.BoxGeometry(0.2, 0.5, 16.3), darkWallMat, 7.5, 0.25, 0, baseGroup);

                addMesh(new THREE.BoxGeometry(3.85, 3.6, 0.2), wallEpsMat, -5.575, 1.8, 0.77, epsGroup); 
                addMesh(new THREE.BoxGeometry(0.05, 3.6, 7.38), glassMat, -3.65, 1.8, 4.46, glassGroup, false); 
                addTable(1.0, 3.6, -5.575, 4.46, furnitureGroup); 
                for (let i = 0; i < 5; i++) { 
                    let zOffset = 3.0 + (i * 0.73);
                    addChair(-6.3, zOffset, Math.PI/2, furnitureGroup);
                    addChair(-4.85, zOffset, -Math.PI/2, furnitureGroup);
                }

                addTable(5.0, 1.0, -4.5, -1.5, furnitureGroup); 
                for (let i = 0; i < 5; i++) { 
                    let xOffset = -6.5 + (i * 1.0);
                    addChair(xOffset, -2.2, 0, furnitureGroup);
                    addChair(xOffset, -0.8, Math.PI, furnitureGroup);
                }

                const sofaGeo = new THREE.BoxGeometry(1.5, 0.5, 0.7);
                addMesh(sofaGeo, seatGreyMat, 1.5, 0.25, -6.5, furnitureGroup).rotation.y = -Math.PI/2;
                addTable(0.6, 0.6, 0.5, -6.5, furnitureGroup); 
                addChair(-0.3, -6.0, Math.PI/2, furnitureGroup);
                addChair(-0.3, -7.0, Math.PI/2, furnitureGroup);

                addMesh(new THREE.BoxGeometry(0.05, 3.6, 4.45), glassMat, 3.22, 1.8, -5.925, glassGroup, false); 
                addMesh(new THREE.BoxGeometry(4.28, 3.6, 0.05), glassMat, 5.36, 1.8, -3.7, glassGroup, false); 
                addTable(1.2, 0.6, 4.5, -5.5, furnitureGroup);
                addTable(1.2, 0.6, 4.5, -6.1, furnitureGroup);
                addTable(1.2, 0.6, 5.7, -5.5, furnitureGroup);
                addTable(1.2, 0.6, 5.7, -6.1, furnitureGroup);
                addChair(4.5, -4.9, 0, furnitureGroup); addChair(5.7, -4.9, 0, furnitureGroup);
                addChair(4.5, -6.7, Math.PI, furnitureGroup); addChair(5.7, -6.7, Math.PI, furnitureGroup);

                addMesh(new THREE.BoxGeometry(3.0, 0.9, 0.6), deskMat, 5.5, 0.45, -1.0, furnitureGroup); 

                addMesh(new THREE.BoxGeometry(4.0, 0.2, 3.0), woodMat, 5.5, 0.1, 3.5, furnitureGroup); 
                addMesh(new THREE.BoxGeometry(3.0, 0.4, 2.0), woodMat, 6.0, 0.2, 3.0, furnitureGroup); 
                addMesh(new THREE.BoxGeometry(2.0, 0.6, 1.0), woodMat, 6.5, 0.3, 2.5, furnitureGroup); 
                addMesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), accentMat, 5.5, 0.25, 4.0, furnitureGroup); 
                addMesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), darkWallMat, 6.5, 0.45, 3.5, furnitureGroup); 
                addTable(2.5, 0.6, 5.5, 6.0, furnitureGroup); 
                addChair(5.5, 6.8, Math.PI, furnitureGroup);

                addMesh(sofaGeo, seatGreyMat, -1.0, 0.25, 7.5, furnitureGroup);
                addMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16), darkWallMat, -2.0, 0.2, 6.5, furnitureGroup);
                addMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16), accentMat, -1.0, 0.2, 6.5, furnitureGroup);
                addMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16), darkWallMat, 0.0, 0.2, 6.5, furnitureGroup);

                // Garuda Artifact
                coreObj = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), accentMat);
                coreObj.scale.set(1, 1.5, 0.5); artifactGroup.add(coreObj);
                const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 16, 64);
                ring1 = new THREE.Mesh(ringGeo, accentMat); ring1.rotation.x = Math.PI/2; artifactGroup.add(ring1);
                ring2 = new THREE.Mesh(ringGeo, accentMat); ring2.rotation.y = Math.PI/2; artifactGroup.add(ring2);
                
                garudaLight = new THREE.SpotLight(0xeab308, 0, 10, Math.PI/4, 0.5, 1);
                garudaLight.position.set(0, 4, 2);
                garudaLight.target = coreObj;
                artifactGroup.add(garudaLight);
                scene.add(garudaLight.target);

                // Simulation Game Studio - Nine-layer GX-100 concept
                addMesh(new THREE.CylinderGeometry(1.2, 1.4, 0.2, 32), pedestalMat, 0, 0.1, 0, studioGroup);
                
                // GX-100: Finish / Kalci board / Fibreglass / PU glue / EPS / mirrored faces.
                const layerNames = ['Finish','Kalci board','Fibreglass mesh','PU glue','EPS core','PU glue','Fibreglass mesh','Kalci board','Finish'];
                const layerMaterials = [finishMat,boardMat,meshMat,adhesiveMat,epsCoreMat,adhesiveMat,meshMat,boardMat,finishMat];
                gxLayers = layerMaterials.map((material,index) => {
                    const layer = new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,index===4?0.16:0.012),material);
                    layer.name = layerNames[index];
                    layer.userData.restZ = index===4?0:Math.sign(4-index)*(0.09+Math.abs(4-index)*0.013);
                    layer.position.z = layer.userData.restZ;
                    layer.castShadow = true;
                    panelGroup.add(layer);
                    return layer;
                });

                studioLight = new THREE.SpotLight(0xffffff, 0, 15, Math.PI/6, 0.5, 1);
                studioLight.position.set(-5.5, 6.0, -6.5);
                studioLight.target = panelGroup;
                scene.add(studioLight);
                scene.add(studioLight.target);
                
                // PC Controls
                window.addEventListener('keydown', (e) => {
                    if (!vrState.active) return;
                    switch(e.code) {
                        case 'KeyW': case 'ArrowUp': vrState.fwd = true; break;
                        case 'KeyA': case 'ArrowLeft': vrState.lft = true; break;
                        case 'KeyS': case 'ArrowDown': vrState.bwd = true; break;
                        case 'KeyD': case 'ArrowRight': vrState.rgt = true; break;
                        case 'ShiftLeft': case 'ShiftRight': vrState.sprint = true; break;
                        case 'KeyC': cameraMode = (cameraMode + 1) % 3; break;
                        case 'KeyE': if(!isAnalyzing) toggleMaterialAnalysis(); break;
                    }
                });
                window.addEventListener('keyup', (e) => {
                    switch(e.code) {
                        case 'KeyW': case 'ArrowUp': vrState.fwd = false; break;
                        case 'KeyA': case 'ArrowLeft': vrState.lft = false; break;
                        case 'KeyS': case 'ArrowDown': vrState.bwd = false; break;
                        case 'KeyD': case 'ArrowRight': vrState.rgt = false; break;
                        case 'ShiftLeft': case 'ShiftRight': vrState.sprint = false; break;
                    }
                });

                // Desktop Mouse/Scroll Controls
                window.addEventListener('wheel', (e) => {
                    if(vrState.active && !isAnalyzing) {
                        targetFov = Math.max(15, Math.min(75, targetFov + e.deltaY * 0.05));
                    }
                });
                document.addEventListener('mousemove', (e) => {
                    if (!vrState.locked || !vrState.active || isTouchDevice || isAnalyzing) return;
                    vrState.yaw -= e.movementX * 0.002;
                    vrState.pitch -= e.movementY * 0.002;
                    vrState.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, vrState.pitch));
                });
                document.addEventListener('pointerlockchange', () => {
                    const canvas = document.getElementById('glcanvas');
                    vrState.locked = document.pointerLockElement === canvas;
                    if (!vrState.locked && vrState.active && !isTouchDevice && !isAnalyzing) toggleVRMode(); 
                });

                // Mobile Touch Controls safely bound
                let lastTouchX = 0, lastTouchY = 0, joyActive = false;
                let joyCenter = { x: 0, y: 0 };
                const touchCanvasContainer = document.getElementById('canvas-container');
                const joyZone = document.getElementById('mobile-joystick');
                const joyKnob = document.getElementById('mobile-joystick-knob');

                if (touchCanvasContainer) {
                    touchCanvasContainer.addEventListener('touchstart', (e) => {
                        if (!vrState.active || !isTouchDevice || isAnalyzing) return;
                        const touch = Array.from(e.touches).find(t => t.target.id !== 'mobile-joystick-knob' && t.target.id !== 'mobile-joystick');
                        if (touch) { lastTouchX = touch.pageX; lastTouchY = touch.pageY; }
                    });

                    touchCanvasContainer.addEventListener('touchmove', (e) => {
                        if (!vrState.active || !isTouchDevice || isAnalyzing) return;
                        const touch = Array.from(e.touches).find(t => t.target.id !== 'mobile-joystick-knob' && t.target.id !== 'mobile-joystick');
                        if (touch && lastTouchX !== 0) {
                            vrState.yaw -= (touch.pageX - lastTouchX) * 0.006;
                            vrState.pitch -= (touch.pageY - lastTouchY) * 0.006;
                            vrState.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, vrState.pitch));
                            lastTouchX = touch.pageX;
                            lastTouchY = touch.pageY;
                        }
                    });
                }

                if (joyZone) {
                    joyZone.addEventListener('touchstart', (e) => {
                        e.preventDefault(); 
                        joyActive = true;
                        const rect = joyZone.getBoundingClientRect();
                        joyCenter = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
                        updateJoystick(e.touches[0]);
                    });
                    joyZone.addEventListener('touchmove', (e) => {
                        e.preventDefault();
                        if (joyActive) updateJoystick(e.touches[0]);
                    });
                    joyZone.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        joyActive = false;
                        if(joyKnob) joyKnob.style.transform = `translate(0px, 0px)`;
                        if (vrState.joystickMove) vrState.joystickMove.set(0, 0);
                    });
                }

                function updateJoystick(touch) {
                    let dx = touch.clientX - joyCenter.x;
                    let dy = touch.clientY - joyCenter.y;
                    const distance = Math.min(Math.hypot(dx, dy), 30); 
                    const angle = Math.atan2(dy, dx);
                    const knobX = Math.cos(angle) * distance;
                    const knobY = Math.sin(angle) * distance;
                    if(joyKnob) joyKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
                    if (vrState.joystickMove) vrState.joystickMove.set(knobX / 30, knobY / 30); 
                }

                window.addEventListener('resize', () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                });

                isThreeSetupComplete = true;
            } catch (error) {
                console.error("Three.js architecture failed to load:", error);
            }
        }

        // --- PRELOADER SEQUENCE & LOOP INIT ---
        let loadProgress = 0;
        const loadInterval = setInterval(() => {
            loadProgress += Math.random() * 5.5 + 2.0; 
            if (loadProgress >= 100) {
                loadProgress = 100;
                clearInterval(loadInterval);
                cinematicPhase = 1; 
                
                if (typeof THREE !== 'undefined' && !isThreeSetupComplete) init3D();
                
                setTimeout(() => {
                    const pl = document.getElementById('preloader');
                    if(pl) {
                        pl.style.opacity = '0';
                        pl.style.pointerEvents = 'none';
                        // Destructively remove preloader node to guarantee it doesn't block clicks
                        setTimeout(() => pl.remove(), 1000); 
                    }
                    setTimeout(() => {
                        cinematicPhase = 2; 
                        const mu = document.getElementById('main-ui');
                        if (mu) {
                            mu.classList.remove('opacity-0', 'translate-y-4');
                            mu.classList.add('opacity-100', 'translate-y-0');
                        }
                        isLoaded = true;
                    }, 1000); 
                }, 500); 
            }
            const pb = document.getElementById('progress-bar');
            if (pb) pb.style.width = Math.min(loadProgress, 100) + '%';
            const pt = document.getElementById('progress-text');
            if (pt) pt.innerText = Math.floor(Math.min(loadProgress, 100)) + '%';
        }, 40);

        // --- MAIN RENDER LOOP ---
        function animate() {
            requestAnimationFrame(animate);

            if (isThreeSetupComplete && scene && camera && renderer) {
                const delta = Math.min(clock.getDelta(), 0.1); 
                const elapsedTime = clock.getElapsedTime();

                let targetZSpread = 0; 

                if (vrState.active) {
                    
                    if (isAnalyzing) {
                        targetZSpread = 0.5; // Trigger panel explosion
                        const studioCamPos = new THREE.Vector3(-5.5, 1.6, -4.0);
                        const studioLookAt = new THREE.Vector3(-5.5, 1.8, -6.5);
                        
                        camera.position.lerp(studioCamPos, 0.05);
                        currentLook.lerp(studioLookAt, 0.05);
                        camera.lookAt(currentLook);
                        
                        // Sync player position to avoid jumps when exiting analysis
                        if (playerPos) {
                            playerPos.copy(camera.position); 
                            playerPos.y = 0;
                        }
                        vrState.pitch = 0;
                        vrState.yaw = 0;

                    } else {
                        // Standard VR Movement Logic
                        vrState.velocity.x -= vrState.velocity.x * 10.0 * delta;
                        vrState.velocity.z -= vrState.velocity.z * 10.0 * delta;

                        const joyY = vrState.joystickMove ? vrState.joystickMove.y : 0;
                        const joyX = vrState.joystickMove ? vrState.joystickMove.x : 0;

                        vrState.direction.z = Number(vrState.fwd) - Number(vrState.bwd) - joyY;
                        vrState.direction.x = Number(vrState.rgt) - Number(vrState.lft) + joyX;
                        vrState.direction.normalize();

                        const speed = vrState.sprint ? 40.0 : 20.0;
                        if (vrState.fwd || vrState.bwd || joyY !== 0) vrState.velocity.z -= vrState.direction.z * speed * delta;
                        if (vrState.lft || vrState.rgt || joyX !== 0) vrState.velocity.x -= vrState.direction.x * speed * delta;

                        const fwdVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0,1,0), vrState.yaw);
                        const rgtVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), vrState.yaw);

                        if (playerPos) {
                            playerPos.addScaledVector(fwdVec, -vrState.velocity.z * delta);
                            playerPos.addScaledVector(rgtVec, vrState.velocity.x * delta);

                            playerPos.x = Math.max(-7.0, Math.min(7.0, playerPos.x));
                            playerPos.z = Math.max(-7.6, Math.min(7.6, playerPos.z));
                            
                            // Handle Multiple Camera Angle Views
                            if (cameraMode === 0) { // FPV
                                camera.position.copy(playerPos);
                                camera.position.y += Math.sin(vrState.bobTimer) * 0.08; 
                                camera.rotation.set(vrState.pitch, vrState.yaw, 0, 'YXZ');
                            } else if (cameraMode === 1) { // Aerial Drone
                                camera.position.lerp(playerPos.clone().add(new THREE.Vector3(0, 15, 0)), 0.1);
                                currentLook.lerp(playerPos, 0.1);
                                camera.lookAt(currentLook);
                            } else if (cameraMode === 2) { // Isometric Follow
                                camera.position.lerp(playerPos.clone().add(new THREE.Vector3(8, 8, 8)), 0.1);
                                currentLook.lerp(playerPos, 0.1);
                                camera.lookAt(currentLook);
                            }
                        }

                        const isMoving = vrState.fwd || vrState.bwd || vrState.lft || vrState.rgt || (vrState.joystickMove && vrState.joystickMove.lengthSq() > 0);
                        if (isMoving) vrState.bobTimer += delta * (vrState.sprint ? 14 : 8);
                        else vrState.bobTimer += (0 - vrState.bobTimer) * delta * 5; 
                    }

                    // Handle interaction prompts
                    let promptVisible = false;
                    const gameObjectiveEl = document.getElementById('game-objective');
                    const gamePromptEl = document.getElementById('game-prompt');
                    const crosshairEl = document.getElementById('crosshair');

                    for (let i = 0; i < gamePOIs.length; i++) {
                        const poi = gamePOIs[i];
                        if (poi.pos && playerPos) {
                            const dist = Math.hypot(playerPos.x - poi.pos.x, playerPos.z - poi.pos.z);
                            if (dist < 2.5) {
                                promptVisible = true;
                                if (poi.title === "Fjäll EPS Simulator") {
                                    targetZSpread = 0.4; 
                                }

                                if (!poi.triggered) {
                                    poi.triggered = true;
                                    if(gameObjectiveEl) {
                                        gameObjectiveEl.innerText = "Asset Scanned: " + poi.title;
                                        const parentClasses = gameObjectiveEl.parentElement.classList;
                                        parentClasses.remove('text-gray-900');
                                        parentClasses.add('text-[#54d2b2]');
                                        
                                        setTimeout(() => {
                                            parentClasses.remove('text-[#54d2b2]');
                                            parentClasses.add('text-gray-900');
                                            gameObjectiveEl.innerText = "Scan Facility Assets";
                                        }, 3000);
                                    }
                                }
                            }
                        }
                    }
                    
                    if (promptVisible && !isAnalyzing) {
                        if(gamePromptEl) gamePromptEl.style.opacity = '1';
                        if(crosshairEl) {
                            crosshairEl.style.transform = 'scale(1.5)';
                            crosshairEl.style.backgroundColor = '#54d2b2';
                            crosshairEl.style.borderColor = 'transparent';
                        }
                    } else {
                        if(gamePromptEl) gamePromptEl.style.opacity = '0';
                        if(crosshairEl) {
                            crosshairEl.style.transform = 'scale(1)';
                            crosshairEl.style.backgroundColor = 'rgba(0,0,0,0.4)';
                            crosshairEl.style.borderColor = 'rgba(255,255,255,0.8)';
                        }
                    }

                    // Reset Isometric offsets
                    epsGroup.position.y += (0 - epsGroup.position.y) * 0.1;
                    glassGroup.position.y += (0 - glassGroup.position.y) * 0.1;
                    furnitureGroup.position.y += (0 - furnitureGroup.position.y) * 0.1;
                    garudaLight.intensity += (2.0 - garudaLight.intensity) * 0.1;
                    studioLight.intensity += (0 - studioLight.intensity) * 0.1;

                    // Smooth FOV Zoom
                    camera.fov += (targetFov - camera.fov) * 0.1;
                    camera.updateProjectionMatrix();

                } else {
                    // Presentation Cinematic View
                    if (cinematicPhase === 0) {
                        targetPos.set(0, 55, 0.1); targetLook.set(0, 0, 0);
                        camera.position.copy(targetPos); currentLook.copy(targetLook);
                    } else if (cinematicPhase === 1) {
                        const orbitRadius = 10;
                        targetPos.set(Math.sin(elapsedTime * 0.15) * orbitRadius, 35, Math.cos(elapsedTime * 0.15) * orbitRadius); 
                        targetLook.set(0, 0, 0);
                    } else {
                        const slide = slides[currentSlideIndex];
                        targetPos.set(slide.pos[0], slide.pos[1], slide.pos[2]);
                        targetLook.set(slide.lookAt[0], slide.lookAt[1], slide.lookAt[2]);
                    }

                    const camDamp = 1 - Math.exp(-1.5 * delta); 
                    camera.position.lerp(targetPos, camDamp);
                    currentLook.lerp(targetLook, camDamp);
                    camera.lookAt(currentLook);
                    
                    vrState.yaw = 0; vrState.pitch = -Math.PI / 4; 

                    let targetEpsY = 0, targetGlassY = 0, targetFurnY = 0, garudaLgt = 0, studioLgt = 0;
                    if (cinematicPhase === 2) {
                        const slide = slides[currentSlideIndex];
                        if (slide.focus === 'eps') { targetEpsY = 1.0; targetFurnY = -0.5; } 
                        else if (slide.focus === 'glass') { targetGlassY = 1.0; targetFurnY = -0.5; } 
                        else if (slide.focus === 'artifact') { garudaLgt = 5.0; }
                        else if (slide.focus === 'studio') { 
                            studioLgt = 8.0; 
                            targetZSpread = 0.4; 
                            targetFurnY = -0.5; 
                        }
                    }

                    const moveDamp = 1 - Math.exp(-5 * delta);
                    epsGroup.position.y += (targetEpsY - epsGroup.position.y) * moveDamp;
                    glassGroup.position.y += (targetGlassY - glassGroup.position.y) * moveDamp;
                    furnitureGroup.position.y += (targetFurnY - furnitureGroup.position.y) * moveDamp;
                    garudaLight.intensity += (garudaLgt - garudaLight.intensity) * moveDamp;
                    studioLight.intensity += (studioLgt - studioLight.intensity) * moveDamp;
                    
                    camera.fov = 32; // Default presentation FOV
                    camera.updateProjectionMatrix();
                }

                // Idle Animations
                artifactGroup.position.y = 2.5 + Math.sin(elapsedTime * 2) * 0.15;
                coreObj.rotation.y = elapsedTime * 0.5;
                ring1.rotation.x = (Math.PI/2) + Math.sin(elapsedTime) * 0.2;
                ring2.rotation.z = Math.cos(elapsedTime * 0.8) * 0.2;

                // Exploded nine-layer GX-100 concept
                panelGroup.rotation.y = elapsedTime * 0.5;
                panelGroup.position.y = 1.8 + Math.sin(elapsedTime * 2) * 0.1;
                const expDamp = 1 - Math.exp(-6 * delta);
                gxLayers.forEach((layer,index) => {
                    const targetZ = layer.userData.restZ + (4-index)*targetZSpread;
                    layer.position.z += (targetZ-layer.position.z)*expDamp;
                });

                const simHud = document.getElementById('simulation-hud');
                if (simHud) {
                    if (isAnalyzing || (cinematicPhase === 2 && slides[currentSlideIndex].focus === 'studio')) {
                        simHud.classList.remove('opacity-0', 'translate-y-4');
                        simHud.classList.add('opacity-100', 'translate-y-0');
                    } else {
                        simHud.classList.add('opacity-0', 'translate-y-4');
                        simHud.classList.remove('opacity-100', 'translate-y-0');
                    }
                }

                renderer.render(scene, camera);
            }
        }
        
        animate();

    