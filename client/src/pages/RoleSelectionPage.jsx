import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function RoleSelectionPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const PLACEHOLDERS = [
        'software developer',
        'student',
        'project manager',
        'graphic designer',
        'data analyst'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
                setIsFading(false);
            }, 500); // Wait for fade out before changing text
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (role.trim()) {
            navigate(`/interview/${encodeURIComponent(role.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Cancel
                </button>
                <h1 className="text-xl font-normal text-[#5f6368]">
                    interview <span className="text-[#1a73e8] font-medium">warmup</span>
                </h1>
                <div className="w-20" /> {/* Spacer */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in -mt-20">
                <div className="max-w-4xl w-full space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-5xl animate-wave origin-bottom-right">👋</span>
                        <h2 className="text-[32px] text-[#202124] font-normal leading-tight">
                            To start, share a current or previous role:
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full relative">
                        <div className="relative group flex items-center min-h-[120px]">
                            {/* Animated Placeholder */}
                            {!role && (
                                <div
                                    className={`absolute inset-0 flex items-center pointer-events-none transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
                                >
                                    <span className="text-[80px] text-[#dadce0] font-normal whitespace-nowrap flex items-center">
                                        {PLACEHOLDERS[placeholderIndex]}
                                        <span className="ml-1 w-1 h-[80px] bg-[#dadce0] animate-pulse"></span>
                                    </span>
                                </div>
                            )}

                            {/* Actual Input */}
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-transparent text-[80px] text-[#202124] border-none focus:ring-0 focus:outline-none outline-none p-0 font-normal caret-[#1a73e8] selection:bg-[#d2e3fc] selection:text-[#174ea6]"
                                autoFocus
                                spellCheck={false}
                                style={{ caretColor: '#1a73e8' }}
                            />
                        </div>

                        <div className="mt-8 h-16 flex justify-start">
                            {role.trim() && (
                                <button
                                    type="submit"
                                    className="bg-[#d2e3fc] text-[#174ea6] hover:bg-[#c2d7fa] text-lg font-medium px-12 py-3 rounded-lg transition-all animate-fade-in"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="fixed bottom-8 left-0 right-0 text-center">
                        <div className="text-[#5f6368] flex items-center justify-center gap-2 text-sm">
                            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">?</span>
                            Have a military occupation code (MOS, AFSC, NEC)? Enter it here (e.g., "MOS 09L").
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
