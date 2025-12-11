import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <div className="max-w-2xl w-full space-y-8">
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-[64px] font-normal text-[#202124] tracking-tight leading-tight">
                        interview <span className="text-[#1a73e8] font-medium">warmup</span>
                    </h1>
                </div>

                <div className="space-y-6 py-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <p className="text-[22px] text-[#5f6368] leading-relaxed">
                        A quick way to prepare for your next interview in
                        <span className="block mt-3 bg-[#e8f0fe] text-[#1967d2] px-4 py-1 rounded-full inline-block mx-2 font-medium text-lg">
                            Data Analytics
                        </span>
                    </p>
                    <p className="text-[#5f6368] text-lg max-w-lg mx-auto leading-relaxed">
                        Practice key questions, get insights about your answers, and get more comfortable interviewing.
                    </p>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <button
                        onClick={() => navigate('/roles')}
                        className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xl font-medium px-10 py-4 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Start practicing
                    </button>
                </div>
            </div>
        </main>
    );
}
