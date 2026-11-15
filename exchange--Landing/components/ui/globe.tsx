"use client";

import { useEffect, useRef } from "react";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  Group,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import ThreeGlobe from "three-globe";
import countries from "@/data/globe.json";

const RING_PROPAGATION_SPEED = 3;
const cameraZ = 300;

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

function buildGlobeData(globe: ThreeGlobe, data: Position[], globeConfig: GlobeConfig) {
  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  const globeMaterial = globe.globeMaterial() as unknown as {
    color: Color;
    emissive: Color;
    emissiveIntensity: number;
    shininess: number;
  };

  globeMaterial.color = new Color(defaultProps.globeColor);
  globeMaterial.emissive = new Color(defaultProps.emissive);
  globeMaterial.emissiveIntensity = defaultProps.emissiveIntensity;
  globeMaterial.shininess = defaultProps.shininess;

  const points = data.flatMap((arc) => [
    {
      size: defaultProps.pointSize,
      order: arc.order,
      color: arc.color,
      lat: arc.startLat,
      lng: arc.startLng,
    },
    {
      size: defaultProps.pointSize,
      order: arc.order,
      color: arc.color,
      lat: arc.endLat,
      lng: arc.endLng,
    },
  ]);

  const filteredPoints = points.filter(
    (point, index, allPoints) =>
      allPoints.findIndex(
        (candidate) => candidate.lat === point.lat && candidate.lng === point.lng,
      ) === index,
  );

  globe
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(defaultProps.showAtmosphere)
    .atmosphereColor(defaultProps.atmosphereColor)
    .atmosphereAltitude(defaultProps.atmosphereAltitude)
    .hexPolygonColor(() => defaultProps.polygonColor);

  globe
    .arcsData(data)
    .arcStartLat((d: unknown) => (d as { startLat: number }).startLat)
    .arcStartLng((d: unknown) => (d as { startLng: number }).startLng)
    .arcEndLat((d: unknown) => (d as { endLat: number }).endLat)
    .arcEndLng((d: unknown) => (d as { endLng: number }).endLng)
    .arcColor((d: unknown) => (d as { color: string }).color)
    .arcAltitude((d: unknown) => (d as { arcAlt: number }).arcAlt)
    .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
    .arcDashLength(defaultProps.arcLength)
    .arcDashInitialGap((d: unknown) => (d as { order: number }).order)
    .arcDashGap(15)
    .arcDashAnimateTime(() => defaultProps.arcTime);

  globe
    .pointsData(filteredPoints)
    .pointColor((d: unknown) => (d as { color: string }).color)
    .pointsMerge(true)
    .pointAltitude(0)
    .pointRadius(2);

  globe
    .ringsData([])
    .ringColor(() => defaultProps.polygonColor)
    .ringMaxRadius(defaultProps.maxRings)
    .ringPropagationSpeed(RING_PROPAGATION_SPEED)
    .ringRepeatPeriod(
      (defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings,
    );
}

export function World({ globeConfig, data }: WorldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new Scene();
    scene.fog = new Fog(0xffffff, 400, 2000);

    const camera = new PerspectiveCamera(50, 1, 180, 1800);
    camera.position.z = cameraZ;
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xffaaff, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.width = "100%";
    container.appendChild(renderer.domElement);

    const rootGroup = new Group();
    scene.add(rootGroup);

    const globe = new ThreeGlobe();
    rootGroup.add(globe);
    buildGlobeData(globe, data, globeConfig);

    const ambientLight = new AmbientLight(globeConfig.ambientLight, 0.6);
    const directionalLeftLight = new DirectionalLight(globeConfig.directionalLeftLight, 1);
    directionalLeftLight.position.copy(new Vector3(-400, 100, 400));
    const directionalTopLight = new DirectionalLight(globeConfig.directionalTopLight, 1);
    directionalTopLight.position.copy(new Vector3(-200, 500, 200));
    const pointLight = new PointLight(globeConfig.pointLight, 0.8);
    pointLight.position.copy(new Vector3(-200, 500, 200));

    scene.add(ambientLight, directionalLeftLight, directionalTopLight, pointLight);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const nextWidth = Math.max(width, 2);
      const nextHeight = Math.max(height, 2);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(nextWidth, nextHeight, false);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const ringInterval = window.setInterval(() => {
      const newNumbersOfRings = genRandomNumbers(
        0,
        data.length,
        Math.floor((data.length * 4) / 5),
      );

      globe.ringsData(
        data
          .filter((_, index) => newNumbersOfRings.includes(index))
          .map((arc) => ({
            lat: arc.startLat,
            lng: arc.startLng,
            color: arc.color,
          })),
      );
    }, 2000);

    let frameId = 0;
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (globeConfig.autoRotate ?? true) {
        rootGroup.rotation.y += delta * (globeConfig.autoRotateSpeed ?? 1) * 0.35;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearInterval(ringInterval);
      resizeObserver.disconnect();
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [data, globeConfig]);

  return <div ref={containerRef} className="h-full w-full" />;
}

export function hexToRgb(hex: string) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }

  return arr;
}
