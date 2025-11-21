import React from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

export default function ControlPanel({ isSessionActive, onStartSession, onStopSession }) {
    return (
        <div className="flex justify-center gap-4 mt-8">
            {!isSessionActive ? (
                <button
                    onClick={onStartSession}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-green-500/30"
                >
                    <Phone className="w-5 h-5" />
                    Start Interview
                </button>
            ) : (
                <button
                    onClick={onStopSession}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-red-500/30"
                >
                    <PhoneOff className="w-5 h-5" />
                    End Interview
                </button>
            )}
        </div>
    );
}
