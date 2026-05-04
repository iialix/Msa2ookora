import { useEffect, useRef } from "react";
import {
    Vector3 as a,
    MeshPhysicalMaterial as c,
    InstancedMesh as d,
    Timer,
    AmbientLight as f,
    SphereGeometry as g,
    ShaderChunk as h,
    Scene as i,
    Color as l,
    Object3D as m,
    SRGBColorSpace as n,
    MathUtils as o,
    PMREMGenerator as p,
    Vector2 as r,
    WebGLRenderer as s,
    PerspectiveCamera as t,
    PointLight as u,
    ACESFilmicToneMapping as v,
    Plane as w,
    Raycaster as y,
    IcosahedronGeometry,
    CanvasTexture,
    ShaderMaterial,
    PlaneGeometry,
    Mesh,
    OrthographicCamera,
    WebGLRenderTarget,
    NearestFilter,
    RGBAFormat,
    UnsignedByteType,
} from "three";
import { RoomEnvironment as z } from "three/examples/jsm/environments/RoomEnvironment.js";

class x {
    #e;
    canvas;
    camera;
    cameraMinAspect;
    cameraMaxAspect;
    cameraFov;
    maxPixelRatio;
    minPixelRatio;
    scene;
    renderer;
    #t;
    size = {
        width: 0,
        height: 0,
        wWidth: 0,
        wHeight: 0,
        ratio: 0,
        pixelRatio: 0,
    };
    render = this.#i;
    onBeforeRender = () => { };
    onAfterRender = () => { };
    onAfterResize = () => { };
    #s = false;
    #n = false;
    isDisposed = false;
    #o;
    #r;
    #a;
    #c = new Timer();
    #h = { elapsed: 0, delta: 0 };
    #l;
    constructor(e) {
        this.#e = { ...e };
        this.#m();
        this.#d();
        this.#p();
        this.resize();
        this.#g();
    }
    #m() {
        this.camera = new t();
        this.cameraFov = this.camera.fov;
    }
    #d() {
        this.scene = new i();
    }
    #p() {
        if (this.#e.canvas) {
            this.canvas = this.#e.canvas;
        } else if (this.#e.id) {
            this.canvas = document.getElementById(this.#e.id);
        } else {
            console.error("Three: Missing canvas or id parameter");
        }
        this.canvas.style.display = "block";
        const e = {
            canvas: this.canvas,
            powerPreference: "high-performance",
            ...(this.#e.rendererOptions ?? {}),
        };
        this.renderer = new s(e);
        this.renderer.outputColorSpace = n;
    }
    #g() {
        if (!(this.#e.size instanceof Object)) {
            window.addEventListener("resize", this.#f.bind(this));
            if (this.#e.size === "parent" && this.canvas.parentNode) {
                this.#r = new ResizeObserver(this.#f.bind(this));
                this.#r.observe(this.canvas.parentNode);
            }
        }
        this.#o = new IntersectionObserver(this.#u.bind(this), {
            root: null,
            rootMargin: "0px",
            threshold: 0,
        });
        this.#o.observe(this.canvas);
        document.addEventListener("visibilitychange", this.#v.bind(this));
    }
    #y() {
        window.removeEventListener("resize", this.#f.bind(this));
        this.#r?.disconnect();
        this.#o?.disconnect();
        document.removeEventListener("visibilitychange", this.#v.bind(this));
    }
    #u(e) {
        this.#s = e[0].isIntersecting;
        this.#s ? this.#w() : this.#z();
    }
    #v() {
        if (this.#s) {
            document.hidden ? this.#z() : this.#w();
        }
    }
    #f() {
        if (this.#a) clearTimeout(this.#a);
        this.#a = setTimeout(this.resize.bind(this), 100);
    }
    resize() {
        let e, t;
        if (this.#e.size instanceof Object) {
            e = this.#e.size.width;
            t = this.#e.size.height;
        } else if (this.#e.size === "parent" && this.canvas.parentNode) {
            e = this.canvas.parentNode.offsetWidth;
            t = this.canvas.parentNode.offsetHeight;
        } else {
            e = window.innerWidth;
            t = window.innerHeight;
        }
        this.size.width = e;
        this.size.height = t;
        this.size.ratio = e / t;
        this.#x();
        this.#b();
        this.onAfterResize(this.size);
    }
    #x() {
        this.camera.aspect = this.size.width / this.size.height;
        if (this.camera.isPerspectiveCamera && this.cameraFov) {
            if (
                this.cameraMinAspect &&
                this.camera.aspect < this.cameraMinAspect
            ) {
                this.#A(this.cameraMinAspect);
            } else if (
                this.cameraMaxAspect &&
                this.camera.aspect > this.cameraMaxAspect
            ) {
                this.#A(this.cameraMaxAspect);
            } else {
                this.camera.fov = this.cameraFov;
            }
        }
        this.camera.updateProjectionMatrix();
        this.updateWorldSize();
    }
    #A(e) {
        const t =
            Math.tan(o.degToRad(this.cameraFov / 2)) / (this.camera.aspect / e);
        this.camera.fov = 2 * o.radToDeg(Math.atan(t));
    }
    updateWorldSize() {
        if (this.camera.isPerspectiveCamera) {
            const e = (this.camera.fov * Math.PI) / 180;
            this.size.wHeight =
                2 * Math.tan(e / 2) * this.camera.position.length();
            this.size.wWidth = this.size.wHeight * this.camera.aspect;
        } else if (this.camera.isOrthographicCamera) {
            this.size.wHeight = this.camera.top - this.camera.bottom;
            this.size.wWidth = this.camera.right - this.camera.left;
        }
    }
    #b() {
        this.renderer.setSize(this.size.width, this.size.height);
        this.#t?.setSize(this.size.width, this.size.height);
        let e = window.devicePixelRatio;
        if (this.maxPixelRatio && e > this.maxPixelRatio) {
            e = this.maxPixelRatio;
        } else if (this.minPixelRatio && e < this.minPixelRatio) {
            e = this.minPixelRatio;
        }
        this.renderer.setPixelRatio(e);
        this.size.pixelRatio = e;
    }
    get postprocessing() {
        return this.#t;
    }
    set postprocessing(e) {
        this.#t = e;
        this.render = e.render.bind(e);
    }
    #w() {
        if (this.#n) return;
        const animate = () => {
            this.#l = requestAnimationFrame(animate);
            this.#c.update();
            this.#h.delta = this.#c.getDelta();
            this.#h.elapsed += this.#h.delta;
            this.onBeforeRender(this.#h);
            this.render();
            this.onAfterRender(this.#h);
        };
        this.#n = true;
        animate();
    }
    #z() {
        if (this.#n) {
            cancelAnimationFrame(this.#l);
            this.#n = false;
        }
    }
    #i() {
        this.renderer.render(this.scene, this.camera);
    }
    clear() {
        this.scene.traverse((e) => {
            if (
                e.isMesh &&
                typeof e.material === "object" &&
                e.material !== null
            ) {
                Object.keys(e.material).forEach((t) => {
                    const i = e.material[t];
                    if (
                        i !== null &&
                        typeof i === "object" &&
                        typeof i.dispose === "function"
                    ) {
                        i.dispose();
                    }
                });
                e.material.dispose();
                e.geometry.dispose();
            }
        });
        this.scene.clear();
    }
    dispose() {
        this.#y();
        this.#z();
        this.clear();
        this.#t?.dispose();
        this.renderer.dispose();
        this.isDisposed = true;
    }
}

const b = new Map(),
    A = new r();
let R = false;
function S(e) {
    const t = {
        position: new r(),
        nPosition: new r(),
        hover: false,
        touching: false,
        onEnter() { },
        onMove() { },
        onClick() { },
        onLeave() { },
        ...e,
    };
    (function (e, t) {
        if (!b.has(e)) {
            b.set(e, t);
            if (!R) {
                document.body.addEventListener("pointermove", M);
                document.body.addEventListener("pointerleave", L);
                document.body.addEventListener("click", C);
                R = true;
            }
        }
    })(e.domElement, t);
    t.dispose = () => {
        const t = e.domElement;
        b.delete(t);
        if (b.size === 0) {
            document.body.removeEventListener("pointermove", M);
            document.body.removeEventListener("pointerleave", L);
            document.body.removeEventListener("click", C);
            R = false;
        }
    };
    return t;
}

function M(e) {
    A.x = e.clientX;
    A.y = e.clientY;
    processInteraction();
}
function processInteraction() {
    for (const [elem, t] of b) {
        const i = elem.getBoundingClientRect();
        if (D(i)) {
            P(t, i);
            if (!t.hover) {
                t.hover = true;
                t.onEnter(t);
            }
            t.onMove(t);
        } else if (t.hover && !t.touching) {
            t.hover = false;
            t.onLeave(t);
        }
    }
}
function C(e) {
    A.x = e.clientX;
    A.y = e.clientY;
    for (const [elem, t] of b) {
        const i = elem.getBoundingClientRect();
        P(t, i);
        if (D(i)) t.onClick(t);
    }
}
function L() {
    for (const t of b.values()) {
        if (t.hover) {
            t.hover = false;
            t.onLeave(t);
        }
    }
}

function P(e, t) {
    const { position: i, nPosition: s } = e;
    i.x = A.x - t.left;
    i.y = A.y - t.top;
    s.x = (i.x / t.width) * 2 - 1;
    s.y = (-i.y / t.height) * 2 + 1;
}
function D(e) {
    const { x: t, y: i } = A;
    const { left: s, top: n, width: o, height: r } = e;
    return t >= s && t <= s + o && i >= n && i <= n + r;
}

const { randFloat: k, randFloatSpread: E } = o;
const F = new a();
const I = new a();
const O = new a();
const V = new a();
const B = new a();
const N = new a();
const _ = new a();
const j = new a();
const H = new a();
const T = new a();

class W {
    constructor(e) {
        this.config = e;
        this.positionData = new Float32Array(3 * e.count).fill(0);
        this.velocityData = new Float32Array(3 * e.count).fill(0);
        this.sizeData = new Float32Array(e.count).fill(1);
        this.center = new a();
        this.#R();
        this.setSizes();
    }
    #R() {
        const { config: e, positionData: t } = this;
        this.center.toArray(t, 0);
        for (let i = 1; i < e.count; i++) {
            const s = 3 * i;
            t[s] = E(2 * e.maxX);
            t[s + 1] = E(2 * e.maxY);
            t[s + 2] = E(2 * e.maxZ);
        }
    }
    setSizes() {
        const { config: e, sizeData: t } = this;
        t[0] = e.size0;
        for (let i = 1; i < e.count; i++) {
            t[i] = k(e.minSize, e.maxSize);
        }
    }
    update(e) {
        const {
            config: t,
            center: i,
            positionData: s,
            sizeData: n,
            velocityData: o,
        } = this;
        let r = 0;
        if (t.controlSphere0) {
            r = 1;
            F.fromArray(s, 0);
            F.lerp(i, 0.1).toArray(s, 0);
            V.set(0, 0, 0).toArray(o, 0);
        }
        for (let idx = r; idx < t.count; idx++) {
            const base = 3 * idx;
            I.fromArray(s, base);
            B.fromArray(o, base);
            B.y -= e.delta * t.gravity * n[idx];
            B.multiplyScalar(t.friction);
            B.clampLength(0, t.maxVelocity);
            I.add(B);
            I.toArray(s, base);
            B.toArray(o, base);
        }
        for (let idx = r; idx < t.count; idx++) {
            const base = 3 * idx;
            I.fromArray(s, base);
            B.fromArray(o, base);
            const radius = n[idx];
            for (let jdx = idx + 1; jdx < t.count; jdx++) {
                const otherBase = 3 * jdx;
                O.fromArray(s, otherBase);
                N.fromArray(o, otherBase);
                const otherRadius = n[jdx];
                _.copy(O).sub(I);
                const dist = _.length();
                const sumRadius = radius + otherRadius;
                if (dist < sumRadius) {
                    const overlap = sumRadius - dist;
                    j.copy(_)
                        .normalize()
                        .multiplyScalar(0.5 * overlap);
                    H.copy(j).multiplyScalar(Math.max(B.length(), 1));
                    T.copy(j).multiplyScalar(Math.max(N.length(), 1));
                    I.sub(j);
                    B.sub(H);
                    I.toArray(s, base);
                    B.toArray(o, base);
                    O.add(j);
                    N.add(T);
                    O.toArray(s, otherBase);
                    N.toArray(o, otherBase);
                }
            }
            if (t.controlSphere0) {
                _.copy(F).sub(I);
                const dist = _.length();
                const sumRadius0 = radius + n[0];
                if (dist < sumRadius0) {
                    const diff = sumRadius0 - dist;
                    j.copy(_.normalize()).multiplyScalar(diff);
                    H.copy(j).multiplyScalar(Math.max(B.length(), 2));
                    I.sub(j);
                    B.sub(H);
                }
            }
            if (Math.abs(I.x) + radius > t.maxX) {
                I.x = Math.sign(I.x) * (t.maxX - radius);
                B.x = -B.x * t.wallBounce;
            }
            if (t.gravity === 0) {
                if (Math.abs(I.y) + radius > t.maxY) {
                    I.y = Math.sign(I.y) * (t.maxY - radius);
                    B.y = -B.y * t.wallBounce;
                }
            } else if (I.y - radius < -t.maxY) {
                I.y = -t.maxY + radius;
                B.y = -B.y * t.wallBounce;
            }
            const maxBoundary = Math.max(t.maxZ, t.maxSize);
            if (Math.abs(I.z) + radius > maxBoundary) {
                I.z = Math.sign(I.z) * (t.maxZ - radius);
                B.z = -B.z * t.wallBounce;
            }
            I.toArray(s, base);
            B.toArray(o, base);
        }
    }
}

// ─── Soccer Ball Texture Generator ────────────────────────────────────────────
// Uses an icosahedron voronoi approach: the 12 pentagon centers are icosahedron
// vertices; the 20 hexagon centers are icosahedron face centroids.
// Dot-product comparison avoids expensive acos for fast CPU generation.
function createSoccerBallTextures() {
    const size = 512;

    // Build icosahedron face/vertex data using Three.js IcosahedronGeometry
    const icoGeo = new IcosahedronGeometry(1, 0);
    const posAttr = icoGeo.attributes.position;

    // Collect unique vertices → pentagon centers
    const pentMap = new Map();
    for (let i = 0; i < posAttr.count; i++) {
        const key = `${posAttr.getX(i).toFixed(4)},${posAttr.getY(i).toFixed(4)},${posAttr.getZ(i).toFixed(4)}`;
        if (!pentMap.has(key)) {
            pentMap.set(key, [
                posAttr.getX(i),
                posAttr.getY(i),
                posAttr.getZ(i),
            ]);
        }
    }
    const pentCenters = [...pentMap.values()]; // 12 entries

    // Face centroids → hexagon centers (normalized)
    const hexCenters = [];
    for (let i = 0; i < posAttr.count; i += 3) {
        const cx =
            (posAttr.getX(i) + posAttr.getX(i + 1) + posAttr.getX(i + 2)) / 3;
        const cy =
            (posAttr.getY(i) + posAttr.getY(i + 1) + posAttr.getY(i + 2)) / 3;
        const cz =
            (posAttr.getZ(i) + posAttr.getZ(i + 1) + posAttr.getZ(i + 2)) / 3;
        const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
        hexCenters.push([cx / len, cy / len, cz / len]);
    }
    icoGeo.dispose();

    // Dot-product threshold: how large the gap d1-d2 must be to be outside the seam.
    // Smaller = wider seams.
    const SEAM_THRESHOLD = 0.025;

    // Colour canvas (base texture: white hexagons, dark pentagons, dark seam body)
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = size;
    colorCanvas.height = size;
    const colorCtx = colorCanvas.getContext("2d");
    const colorImg = colorCtx.createImageData(size, size);

    // Emissive canvas (neon cyan / magenta glow on seams)
    const emissCanvas = document.createElement("canvas");
    emissCanvas.width = size;
    emissCanvas.height = size;
    const emissCtx = emissCanvas.getContext("2d");
    const emissImg = emissCtx.createImageData(size, size);

    const TWO_PI = 2 * Math.PI;

    for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
            // Equirectangular → 3-D direction
            const lon = (px / size) * TWO_PI - Math.PI;
            const lat = (1 - py / size) * Math.PI - Math.PI / 2;
            const cosLat = Math.cos(lat);
            const dx = cosLat * Math.sin(lon);
            const dy = Math.sin(lat);
            const dz = cosLat * Math.cos(lon);

            // Find the two closest centers (highest dot product = closest)
            let d1 = -2,
                d2 = -2;
            let isPent = false;

            for (let ci = 0; ci < pentCenters.length; ci++) {
                const p = pentCenters[ci];
                const dot = dx * p[0] + dy * p[1] + dz * p[2];
                if (dot > d1) {
                    d2 = d1;
                    d1 = dot;
                    isPent = true;
                } else if (dot > d2) {
                    d2 = dot;
                }
            }
            for (let ci = 0; ci < hexCenters.length; ci++) {
                const p = hexCenters[ci];
                const dot = dx * p[0] + dy * p[1] + dz * p[2];
                if (dot > d1) {
                    d2 = d1;
                    d1 = dot;
                    isPent = false;
                } else if (dot > d2) {
                    d2 = dot;
                }
            }

            const gap = d1 - d2; // 0 on the seam boundary
            const idx = (py * size + px) * 4;

            if (gap < SEAM_THRESHOLD) {
                // ── Seam region ──────────────────────────────────────────────────────
                const t = gap / SEAM_THRESHOLD; // 0 at seam centre → 1 at panel edge
                // Deep navy panel fading at edge
                const base = Math.round(t * t * 30);
                colorImg.data[idx] = base + 10;
                colorImg.data[idx + 1] = base + 12;
                colorImg.data[idx + 2] = base + 25;
                colorImg.data[idx + 3] = 255;

                // Neon glow: cyan (0,229,255) / magenta (200,0,255) pattern
                const neonStrength = Math.pow(1 - t, 2.5);
                const isCyan = Math.sin(lon * 4 + lat * 3) > 0;
                emissImg.data[idx] = isCyan
                    ? 0
                    : Math.round(neonStrength * 200);
                emissImg.data[idx + 1] = Math.round(
                    neonStrength * (isCyan ? 229 : 0),
                );
                emissImg.data[idx + 2] = Math.round(neonStrength * 255);
                emissImg.data[idx + 3] = 255;
            } else if (isPent) {
                // ── Dark pentagon panel ────────────────────────────────────────────
                colorImg.data[idx] = 18;
                colorImg.data[idx + 1] = 18;
                colorImg.data[idx + 2] = 32;
                colorImg.data[idx + 3] = 255;
                emissImg.data[idx] =
                    emissImg.data[idx + 1] =
                    emissImg.data[idx + 2] =
                    0;
                emissImg.data[idx + 3] = 255;
            } else {
                // ── Silver/white hexagon panel ─────────────────────────────────────
                // Subtle gradient: brighter towards the centre of each cell
                const panelBrightness = Math.round(
                    195 + (gap - SEAM_THRESHOLD) * 400,
                );
                const bright = Math.min(255, panelBrightness);
                colorImg.data[idx] = bright;
                colorImg.data[idx + 1] = bright;
                colorImg.data[idx + 2] = Math.min(255, bright + 18);
                colorImg.data[idx + 3] = 255;
                emissImg.data[idx] =
                    emissImg.data[idx + 1] =
                    emissImg.data[idx + 2] =
                    0;
                emissImg.data[idx + 3] = 255;
            }
        }
    }

    colorCtx.putImageData(colorImg, 0, 0);
    emissCtx.putImageData(emissImg, 0, 0);

    const colorTexture = new CanvasTexture(colorCanvas);
    colorTexture.colorSpace = n; // SRGBColorSpace
    const emissTexture = new CanvasTexture(emissCanvas);

    return { colorTexture, emissTexture };
}

// ─── Custom Subsurface + Soccer-Ball Material ──────────────────────────────
class Y extends c {
    constructor(e) {
        super(e);
        this.uniforms = {
            thicknessDistortion: { value: 0.05 },
            thicknessAmbient: { value: 0.02 },
            thicknessAttenuation: { value: 0.05 },
            thicknessPower: { value: 3 },
            thicknessScale: { value: 6 },
        };
        this.defines.USE_UV = "";
        this.onBeforeCompile = (e) => {
            Object.assign(e.uniforms, this.uniforms);
            e.fragmentShader =
                "\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      " +
                e.fragmentShader;
            e.fragmentShader = e.fragmentShader.replace(
                "void main() {",
                "\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      ",
            );
            const t = h.lights_fragment_begin.replaceAll(
                "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
                "\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        ",
            );
            e.fragmentShader = e.fragmentShader.replace(
                "#include <lights_fragment_begin>",
                t,
            );
            if (this.onBeforeCompile2) this.onBeforeCompile2(e);
        };
    }
}

// ─── Default Config ────────────────────────────────────────────────────────
const X = {
    count: 200,
    // Single colour → setColors() is skipped → instance colours stay white,
    // letting the soccer texture show through unmodulated.
    colors: [0xffffff],
    ambientColor: 0xffffff,
    ambientIntensity: 0.8,
    lightIntensity: 150,
    materialParams: {
        metalness: 0.75,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        color: 0xffffff,
    },
    minSize: 0.5,
    maxSize: 1,
    size0: 1,
    gravity: 0.5,
    friction: 0.9975,
    wallBounce: 0.95,
    maxVelocity: 0.15,
    maxX: 5,
    maxY: 5,
    maxZ: 2,
    controlSphere0: false,
    followCursor: true,
};

const U = new m();

// ─── Instanced Soccer Balls ────────────────────────────────────────────────
class Z extends d {
    constructor(renderer, t = {}) {
        const cfg = { ...X, ...t };
        const envScene = new z();
        const envMap = new p(renderer, 0.04).fromScene(envScene).texture;

        // Build soccer ball textures (runs once; ~50 ms on a typical machine)
        const { colorTexture, emissTexture } = createSoccerBallTextures();

        const sphereGeo = new g(1, 32, 32); // higher segments for smooth balls
        const mat = new Y({
            envMap,
            map: colorTexture,
            emissiveMap: emissTexture,
            emissive: new l(0xffffff),
            emissiveIntensity: 1.8,
            ...cfg.materialParams,
        });
        mat.envMapRotation.x = -Math.PI / 2;

        super(sphereGeo, mat, cfg.count);
        this.config = cfg;
        this.physics = new W(cfg);
        this.#S();

        // Only call setColors if a multi-colour gradient was requested
        if (Array.isArray(cfg.colors) && cfg.colors.length > 1) {
            this.setColors(cfg.colors);
        }
    }

    #S() {
        const isMobile = window.matchMedia("(pointer: coarse)").matches;
        this.ambientLight = new f(
            this.config.ambientColor,
            isMobile ? 0.3 : this.config.ambientIntensity,
        );
        this.add(this.ambientLight);
        this.light = new u(0x00e5ff, isMobile ? 40 : this.config.lightIntensity);
        this.add(this.light);
        // Second accent light in magenta
        this.light2 = new u(0xff00ff, isMobile ? 25 : this.config.lightIntensity * 0.6);
        this.light2.position.set(3, 3, 5);
        this.add(this.light2);
    }

    setColors(e) {
        if (Array.isArray(e) && e.length > 1) {
            const t = (function (e) {
                let t, i;
                function setColors(e) {
                    t = e;
                    i = [];
                    t.forEach((col) => {
                        i.push(new l(col));
                    });
                }
                setColors(e);
                return {
                    setColors,
                    getColorAt: function (ratio, out = new l()) {
                        const scaled =
                            Math.max(0, Math.min(1, ratio)) * (t.length - 1);
                        const idx = Math.floor(scaled);
                        const start = i[idx];
                        if (idx >= t.length - 1) return start.clone();
                        const alpha = scaled - idx;
                        const end = i[idx + 1];
                        out.r = start.r + alpha * (end.r - start.r);
                        out.g = start.g + alpha * (end.g - start.g);
                        out.b = start.b + alpha * (end.b - start.b);
                        return out;
                    },
                };
            })(e);
            for (let idx = 0; idx < this.count; idx++) {
                this.setColorAt(idx, t.getColorAt(idx / this.count));
                if (idx === 0)
                    this.light.color.copy(t.getColorAt(idx / this.count));
            }
            this.instanceColor.needsUpdate = true;
        }
    }

    update(e) {
        this.physics.update(e);
        for (let idx = 0; idx < this.count; idx++) {
            U.position.fromArray(this.physics.positionData, 3 * idx);
            if (idx === 0 && this.config.followCursor === false) {
                U.scale.setScalar(0);
            } else {
                U.scale.setScalar(this.physics.sizeData[idx]);
            }
            U.updateMatrix();
            this.setMatrixAt(idx, U.matrix);
            if (idx === 0) this.light.position.copy(U.position);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

// ─── Public API ────────────────────────────────────────────────────────────
function createBallpit(e, t = {}) {
    const three = new x({
        canvas: e,
        size: "parent",
        rendererOptions: { antialias: true, alpha: true },
    });
    let spheres;
    three.renderer.toneMapping = v;
    three.camera.position.set(0, 0, 20);
    three.camera.lookAt(0, 0, 0);
    three.cameraMaxAspect = 1.5;
    three.resize();
    initialize(t);

    const raycaster = new y();
    const plane = new w(new a(0, 0, 1), 0);
    const intersectPt = new a();
    let paused = false;

    // On touch devices, disable pointer-events so touches pass through to the page
    if (window.matchMedia("(pointer: coarse)").matches) {
        e.style.pointerEvents = "none";
    }

    const pointer = S({
        domElement: e,
        onMove() {
            raycaster.setFromCamera(pointer.nPosition, three.camera);
            three.camera.getWorldDirection(plane.normal);
            raycaster.ray.intersectPlane(plane, intersectPt);
            spheres.physics.center.copy(intersectPt);
            spheres.config.controlSphere0 = true;
        },
        onLeave() {
            spheres.config.controlSphere0 = false;
        },
    });

    function initialize(cfg) {
        if (spheres) {
            three.clear();
            three.scene.remove(spheres);
        }
        spheres = new Z(three.renderer, cfg);
        three.scene.add(spheres);
    }

    three.onBeforeRender = (e) => {
        if (!paused) spheres.update(e);
    };
    three.onAfterResize = (e) => {
        spheres.config.maxX = e.wWidth / 2;
        spheres.config.maxY = e.wHeight / 2;
    };

    return {
        three,
        get spheres() {
            return spheres;
        },
        setCount(n) {
            initialize({ ...spheres.config, count: n });
        },
        togglePause() {
            paused = !paused;
        },
        dispose() {
            pointer.dispose();
            three.dispose();
        },
    };
}

// ─── React Component ───────────────────────────────────────────────────────
const Ballpit = ({ className = "", followCursor = true, ...props }) => {
    const canvasRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        instanceRef.current = createBallpit(canvas, { followCursor, ...props });
        return () => {
            instanceRef.current?.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <canvas
            className={className}
            ref={canvasRef}
            style={{ width: "100%", height: "100%" }}
        />
    );
};

export default Ballpit;

/*
  Component inspired by Kevin Levron:
  https://x.com/soju22/status/1858925191671271801

  Soccer ball texture uses an icosahedron voronoi pattern:
  - 12 pentagon panels at icosahedron vertex positions
  - 20 hexagon panels at icosahedron face-centroid positions
  - Neon cyan (#00e5ff) / magenta (#ff00ff) seam glow generated
    procedurally on a 512×512 CanvasTexture

  Usage:
  <div style={{ position:'relative', overflow:'hidden', minHeight:'500px', width:'100%' }}>
    <Ballpit count={100} gravity={0.01} friction={0.9975} wallBounce={0.95} followCursor={true} />
  </div>
*/
