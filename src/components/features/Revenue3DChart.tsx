import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useRevenueReport } from '../../hooks/useReports';
import { formatCompact } from '../../utils/formatCurrency';

const formatPeriod = (period: string) => {
    const match = period.match(/^(\d{4})[-/](\d{1,2})/);
    if (!match) return period.slice(0, 8);
    return new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit' }).format(
        new Date(Number(match[1]), Number(match[2]) - 1)
    );
};

const Revenue3DChart = () => {
    const { revenue, loading } = useRevenueReport();
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host || loading || revenue.length === 0) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(7.5, 7, 10);
        camera.lookAt(0, 1.4, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        host.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 1.8));
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
        keyLight.position.set(-4, 9, 6);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 7),
            new THREE.MeshStandardMaterial({ color: 0xf1f5f5, roughness: 1 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.025;
        floor.receiveShadow = true;
        scene.add(floor);

        const grid = new THREE.GridHelper(9, 18, 0xb7c6c7, 0xd8e0e1);
        grid.position.y = 0.005;
        scene.add(grid);

        const chartGroup = new THREE.Group();
        scene.add(chartGroup);
        const data = revenue.slice(-7);
        const maxTotal = Math.max(...data.map((item: any) => Number(item.total) || 0), 1);
        const spacing = Math.min(1.15, 6.4 / Math.max(data.length, 1));
        const startX = -((data.length - 1) * spacing) / 2;

        const addText = (text: string, color: string, scale: number, position: THREE.Vector3) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 128;
            const context = canvas.getContext('2d');
            if (!context) return;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = color;
            context.font = '600 44px system-ui, sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 16);
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
            sprite.position.copy(position);
            sprite.scale.set(scale * 2.4, scale * 0.6, 1);
            chartGroup.add(sprite);
        };

        data.forEach((item: any, index: number) => {
            const value = Number(item.total) || 0;
            const height = Math.max((value / maxTotal) * 4.2, value > 0 ? 0.08 : 0.035);
            const x = startX + index * spacing;
            const hue = 0.48 - (index / Math.max(data.length, 1)) * 0.08;
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(hue, 0.58, 0.46),
                roughness: 0.34,
                metalness: 0.12,
            });
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.62, height, 0.72), material);
            bar.position.set(x, height / 2, 0);
            bar.castShadow = true;
            bar.receiveShadow = true;
            chartGroup.add(bar);

            addText(formatCompact(value), '#334155', 0.48, new THREE.Vector3(x, height + 0.24, 0));
            addText(formatPeriod(String(item._id ?? '')), '#64748b', 0.42, new THREE.Vector3(x, 0.02, 0.72));
        });

        const resize = () => {
            const width = Math.max(host.clientWidth, 1);
            const height = Math.max(host.clientHeight, 1);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        let animationFrame = 0;
        let pointerX: number | null = null;
        const canvas = renderer.domElement;
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.cursor = 'grab';
        const pointerDown = (event: PointerEvent) => {
            pointerX = event.clientX;
            canvas.style.cursor = 'grabbing';
            canvas.setPointerCapture(event.pointerId);
        };
        const pointerMove = (event: PointerEvent) => {
            if (pointerX === null) return;
            chartGroup.rotation.y += (event.clientX - pointerX) * 0.008;
            pointerX = event.clientX;
        };
        const pointerUp = () => {
            pointerX = null;
            canvas.style.cursor = 'grab';
        };
        canvas.addEventListener('pointerdown', pointerDown);
        canvas.addEventListener('pointermove', pointerMove);
        canvas.addEventListener('pointerup', pointerUp);
        canvas.addEventListener('pointercancel', pointerUp);

        const animate = () => {
            chartGroup.rotation.y += 0.0008;
            renderer.render(scene, camera);
            animationFrame = window.requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            canvas.removeEventListener('pointerdown', pointerDown);
            canvas.removeEventListener('pointermove', pointerMove);
            canvas.removeEventListener('pointerup', pointerUp);
            canvas.removeEventListener('pointercancel', pointerUp);
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
                    object.geometry?.dispose();
                    const materials = Array.isArray(object.material) ? object.material : [object.material];
                    materials.forEach((material) => {
                        if (material instanceof THREE.SpriteMaterial) material.map?.dispose();
                        material.dispose();
                    });
                }
            });
            renderer.dispose();
            canvas.remove();
        };
    }, [loading, revenue]);

    if (loading) return <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">Loading revenue data...</div>;
    if (!revenue.length) return <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No revenue data available</div>;

    return <div ref={hostRef} aria-label="Interactive 3D revenue bar chart" role="img" className="h-[300px] w-full touch-pan-y sm:h-[340px]" />;
};

export default Revenue3DChart;