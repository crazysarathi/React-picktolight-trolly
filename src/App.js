import React from 'react';
import { MotionConfig } from 'framer-motion';
import KioskPage from 'pages/KioskPage';

/**
 * Single-screen kiosk: no router needed — the collection workflow is a state machine
 * (order-scan → scanning → complete) driven by `useCollectionWorkflow`.
 * `MotionConfig reducedMotion="user"` respects the OS "reduce motion" setting.
 */
function App() {
    return (
        <MotionConfig reducedMotion="user">
            <KioskPage />
        </MotionConfig>
    );
}

export default App;
