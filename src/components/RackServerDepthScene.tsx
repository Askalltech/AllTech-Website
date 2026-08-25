"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * RackServerDepthScene — a still product photo (the switch/rack rails) given
 * a relief effect via depth-map displacement, adapted from a generative
 * noise-mountain shader supplied by the user. The original only ever
 * displaced by Perlin noise and had no texture sampling at all; here the
 * vertex shader instead samples a grayscale depth map (generated offline
 * from the source photo — see rack-server-rooms.astro) to push vertices out
 * of the plane, and the fragment shader samples the actual photo for color.
 *
 * This is a heuristic "pseudo-depth" (inverted, blurred luminance of the
 * original photo — the switch and rails are dark against a white backdrop,
 * so darkness-as-elevation happens to line up with the real subject), not a
 * model-estimated depth map. It reads as a subtle embossed relief, not true
 * photogrammetry — expected, since the source is a product shot on a flat
 * background rather than a scene with real depth variation.
 */
export function RackServerDepthScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0.9, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const colorMap = loader.load("/services/rack-server-rooms-switch.webp");
    const depthMap = loader.load("/services/rack-server-rooms-depth.webp");
    colorMap.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.PlaneGeometry(4, 4, 256, 256);

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        colorMap: { value: colorMap },
        depthMap: { value: depthMap },
        displacementScale: { value: 0.45 },
        pointLightPosition: { value: new THREE.Vector3(0, 0, 3) },
      },
      vertexShader: `
        uniform sampler2D depthMap;
        uniform float displacementScale;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vDepth;

        void main() {
          vUv = uv;
          // Model-estimated depth (Depth Anything): bright = near/subject,
          // dark = far/backdrop — already the convention we want.
          float depth = texture2D(depthMap, uv).r;
          vDepth = depth;
          vec3 newPosition = position + normal * depth * displacementScale;
          vNormal = normal;
          vPosition = newPosition;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D colorMap;
        uniform vec3 pointLightPosition;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vDepth;

        void main() {
          // Model-estimated depth reads the plain backdrop as a receding
          // floor/wall (a real, if unhelpful, depth cue) rather than a flat
          // zero, so the cut has to sit well above the background's range,
          // not at zero — use it as the alpha mask so the subject floats on
          // the page's own background instead of carrying a visible card.
          float alpha = smoothstep(0.55, 0.66, vDepth);
          if (alpha < 0.02) discard;

          vec4 tex = texture2D(colorMap, vUv);
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(pointLightPosition - vPosition);
          float diffuse = max(dot(normal, lightDir), 0.0);
          float ambient = 0.55;
          vec3 lit = tex.rgb * (ambient + diffuse * 0.6);
          // Canvas context is premultipliedAlpha — premultiply here too, or
          // the soft edge of the alpha ramp above blends as a dark fringe.
          gl_FragColor = vec4(lit * alpha, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 3);
    lightRef.current = pointLight;
    scene.add(pointLight);

    let frameId: number;
    const render = () => {
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    // Light follows the pointer within the panel only (not the whole
    // window) — this scene sits inline in a hero, not full-bleed.
    const handlePointerMove = (e: PointerEvent) => {
      const rect = currentMount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const pos = new THREE.Vector3(x * 2, y * 2, 2.2);
      lightRef.current?.position.copy(pos);
      material.uniforms.pointLightPosition.value = pos;
    };

    window.addEventListener("resize", handleResize);
    currentMount.addEventListener("pointermove", handlePointerMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      currentMount.removeEventListener("pointermove", handlePointerMove);
      currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      colorMap.dispose();
      depthMap.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />;
}

export default RackServerDepthScene;
