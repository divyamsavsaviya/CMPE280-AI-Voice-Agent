import React from 'react';

export default function ControlPanel({ isSessionActive, onStartSession, onStopSession }) {
    return (
        <div className="flex justify-center gap-4">
            {!isSessionActive ? (
                <button
                    onClick={onStartSession}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium px-8 py-3 rounded-lg transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Start practicing
                </button>
            ) : (
                <button
                    onClick={onStopSession}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-lg font-medium px-8 py-3 rounded-lg transition-all border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    End interview
                </button>
            )}
        </div>
    );
}

