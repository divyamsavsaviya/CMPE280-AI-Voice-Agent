import React from 'react';
import VoiceInterviewer from './components/VoiceInterviewer';

function App() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    AI Interviewer
                </h1>
                <p className="text-gray-400">Real-time Voice Interview Practice</p>
            </header>

            <main className="w-full max-w-4xl">
                <VoiceInterviewer />
            </main>
        </div>
    );
}

export default App;
