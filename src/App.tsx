import { configure } from '@airstate/client';
import { usePersistentNanoId, useSharedPresence, useSharedState } from '@airstate/react';
import { Switch } from './components/Switch.tsx';
import { Overlay } from './components/Overlay.tsx';
import clsx from 'clsx';

if (!import.meta.env.VITE_AIRSTATE_APP_ID) {
    throw new Error('please set the VITE_AIRSTATE_APP_ID env variable when building');
}

configure({
    appId: import.meta.env.VITE_AIRSTATE_APP_ID,
});

const url = new URL(window.location.href);

function App() {
    const peerId = usePersistentNanoId(url.searchParams.get('peer-id-key') ?? 'default-peer');

    const [state, setState] = useSharedState<'on' | 'off'>('on', {
        channel: `demo_light-switch_${url.pathname}_state`,
    });

    const {
        setState: setPresenceState,
        self,
        others,
    } = useSharedPresence<{ name: string; color: string; pos: [number, number] }>({
        peerId: peerId,
        room: `demo_light-switch_${url.pathname}_presence`,
        initialState: {
            name: url.searchParams.get('name') ?? 'user',
            color: url.searchParams.get('suggested-color') ?? 'hsl(255, 50%, 50%)',
            pos: [2048, 2048],
        },
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const center = [window.innerWidth / 2, window.innerHeight / 2];
        setPresenceState((state) => ({ ...state, pos: [e.clientX - center[0], e.clientY - center[1]] }));
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const center = [window.innerWidth / 2, window.innerHeight / 2];
        setPresenceState((state) => ({
            ...state,
            pos: [e.touches[0].clientX - center[0], e.touches[0].clientY - center[1]],
        }));
    };

    const otherLights = Object.values(others)
        .filter((other) => other.connected)
        .map((other) => other.state);

    const ownLight = self.state;

    return (
        <div
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseLeave={() => {
                setPresenceState((state) => ({
                    ...state,
                    pos: [2048, 2048],
                }));
            }}
            className={clsx(
                'select-none fixed touch-none top-0 left-0 w-screen h-screen bg-white flex items-center justify-center',
            )}>
            <Overlay
                centers={[
                    {
                        ...ownLight,
                        name: 'You',
                    },
                    ...otherLights,
                ]}
                isDark={state === 'off'}
            />
            <Switch state={state} onChange={setState} />
            <div className={'absolute bottom-5 right-40'}>
                <input
                    className={clsx(
                        'w-24 border-2 px-2 py-1 text-sm outline-0 rounded-full bg-white',
                        // state === 'on' ? 'bg-white' : 'bg-black',
                    )}
                    value={self.state.name}
                    style={{ borderColor: self.state.color, color: self.state.color }}
                    onChange={(ev) => {
                        setPresenceState((state) => ({
                            ...state,
                            name: ev.target.value,
                        }));
                    }}
                />
            </div>
        </div>
    );
}

export default App;
