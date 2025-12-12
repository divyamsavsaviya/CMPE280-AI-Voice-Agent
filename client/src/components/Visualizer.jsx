import React from 'react';

export default function Visualizer({ isActive }) {
    return (
        <div className="flex items-center justify-center gap-3 h-16" aria-hidden="true">
            {isActive ? (
                <>
                    <div className="w-4 h-4 bg-[#1a73e8] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-4 h-4 bg-[#1a73e8] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-4 h-4 bg-[#1a73e8] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-4 h-4 bg-[#1a73e8] rounded-full animate-bounce" style={{ animationDelay: '0.45s' }}></div>
                </>
            ) : (
                <div className="w-16 h-16 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#1a73e8] rounded-full opacity-20"></div>
                </div>
            )}
        </div>
    );
}
