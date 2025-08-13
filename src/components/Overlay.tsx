import { useCallback, useEffect, useReducer, useRef } from 'react';
import clsx from 'clsx';

export const TORCH_DIAMETER = 250;

export function Overlay({
    centers,
    isDark,
}: {
    centers: {
        name: string;
        color: string;
        pos: [number, number];
    }[];
    isDark: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const [r, forceRender] = useReducer((x) => x + 1, 0);

    const render = useCallback(
        (centers: [number, number][]) => {
            if (!ctxRef.current) {
                const canvas = canvasRef.current;

                if (!canvas) {
                    return;
                }

                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return;
                }

                ctxRef.current = ctx;
            }

            const ctx = ctxRef.current;

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            ctx.fillStyle = 'rgba(70,65,60,0.8)';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            ctx.globalCompositeOperation = 'destination-out';

            centers.forEach((center) => {
                const x = Math.round(window.innerWidth / 2 + center[0]);
                const y = Math.round(window.innerHeight / 2 + center[1]);
                const radius = Math.round(TORCH_DIAMETER / 2);

                // Create a radial gradient: transparent in the center, opaque at the edge
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
                gradient.addColorStop(0.75, 'rgba(0,0,0,0.8)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.closePath();

                ctx.fillStyle = gradient;
                ctx.fill();
            });

            ctx.globalCompositeOperation = 'source-over';
        },
        [centers],
    );

    useEffect(() => {
        render(centers.map((center) => center.pos));
    }, [centers, r, render]);

    useEffect(() => {
        window.addEventListener('resize', () => {
            forceRender();
        });
    }, []);

    return (
        <div className={'absolute w-full h-full top-0 left-0 z-10 pointer-events-none'}>
            <canvas
                className={clsx(
                    'absolute w-full h-full top-0 left-0 transition-opacity',
                    isDark ? 'opacity-100' : 'opacity-0',
                )}
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
            />
            {centers.map((center) => {
                const x = Math.round(window.innerWidth / 2 + center.pos[0]);
                const y = Math.round(window.innerHeight / 2 + center.pos[1]);

                return (
                    <>
                        <div
                            style={{ left: x, top: y, background: center.color }}
                            className={'absolute w-2 h-2 -translate-1 rounded-full'}></div>
                        <div
                            style={{
                                left: x,
                                top: y,
                                background: center.color,
                            }}
                            className={clsx('absolute translate-2 shadow text-white text-sm px-2 py-1 text-nowrap')}>
                            {center.name}
                        </div>
                    </>
                );
            })}
        </div>
    );
}
