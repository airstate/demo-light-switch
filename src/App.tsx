import { configure } from '@airstate/client';
import { usePersistentNanoId, useSharedPresence, useSharedState } from '@airstate/react';
import { Switch } from './components/Switch.tsx';
import { Darkness } from './components/Darkness.tsx';
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

    const [state, setState] = useSharedState<'on' | 'off'>('off', {
        channel: `demo_light-switch_${url.pathname}_state`,
    });

    const {
        setState: setCursorState,
        self,
        others,
    } = useSharedPresence<[number, number]>({
        peerId: peerId,
        room: `demo_light-switch_${url.pathname}_presence`,
        initialState: [0, 0],
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const center = [window.innerWidth / 2, window.innerHeight / 2];
        setCursorState([e.clientX - center[0], e.clientY - center[1]]);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const center = [window.innerWidth / 2, window.innerHeight / 2];
        setCursorState([e.touches[0].clientX - center[0], e.touches[0].clientY - center[1]]);
    };

    const otherLights = Object.values(others)
        .filter((other) => other.connected)
        .map((other) => other.state);

    const ownLight = self.state;

    return (
        <div
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className={clsx(
                'fixed touch-none top-0 left-0 w-screen h-screen bg-white flex items-center justify-center',
            )}>
            <Darkness centers={[ownLight, ...otherLights]} isDark={state === 'off'} />
            <Switch state={state} onChange={setState} />
        </div>
    );
}

export default App;
