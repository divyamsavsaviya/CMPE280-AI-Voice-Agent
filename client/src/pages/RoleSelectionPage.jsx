import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EXPERIENCE_LEVELS = [
    { id: 'junior', label: 'Junior', sub: '0-2 years' },
    { id: 'mid', label: 'Mid-Level', sub: '3-5 years' },
    { id: 'senior', label: 'Senior', sub: '5+ years' },
    { id: 'staff', label: 'Staff/Principal', sub: '8+ years' },
];

export default function RoleSelectionPage() {
    const navigate = useNavigate();

    // State
    const [step, setStep] = useState(1); // 1: Role, 2: Level, 3: JD, 4: Resume
    const [formData, setFormData] = useState({
        role: '',
        experienceLevel: '',
        jobDescription: '',
        resume: ''
    });

    // Animation State
    const [isFading, setIsFading] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    const PLACEHOLDERS = [
        'software developer',
        'product manager',
        'marketing specialist',
        'data scientist',
        'ux designer'
    ];

    useEffect(() => {
        // CLEANUP ON START: Force clear all interview data to prevent ghost sessions
        localStorage.removeItem('interview_transcript');
        localStorage.removeItem('interview_data');
        localStorage.removeItem('interview_role');
        localStorage.removeItem('interview_experience');
        localStorage.removeItem('current_session_backup');

        // Clear any backup keys
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('completed_session_')) {
                localStorage.removeItem(key);
            }
        });

        if (step === 1) {
            const interval = setInterval(() => {
                setIsFading(true);
                setTimeout(() => {
                    setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
                    setIsFading(false);
                }, 500);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleSkip = () => {
        handleNext();
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (step === 1 && formData.role.trim()) {
            handleNext();
        }
    };

    const handleStartInterview = () => {
        if (formData.role.trim()) {
            navigate(`/interview/${encodeURIComponent(formData.role.trim())}`, {
                state: formData
            });
        }
    };

    const renderStep1_Role = () => (
        <div className="animate-fade-in w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-start gap-4 mb-8">
                <span className="text-6xl animate-wave origin-bottom-right">👋</span>
                <h2 className="text-[32px] text-[#202124] font-normal leading-tight">
                    To start, share a current or previous role:
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="w-full relative mt-6">
                <div className="relative group flex items-center min-h-[120px]">
                    {!formData.role && (
                        <div className={`absolute inset-0 flex items-center pointer-events-none transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="text-[60px] md:text-[80px] text-[#dadce0] font-normal whitespace-nowrap flex items-center">
                                {PLACEHOLDERS[placeholderIndex]}
                                <span className="ml-1 w-1 h-[60px] md:h-[80px] bg-[#dadce0] animate-pulse"></span>
                            </span>
                        </div>
                    )}
                    <input
                        type="text"
                        aria-label="Enter your current or previous role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-transparent text-[60px] md:text-[80px] text-[#202124] border-none focus:ring-0 focus:outline-none outline-none p-0 font-normal caret-[#1a73e8] selection:bg-[#d2e3fc] selection:text-[#174ea6]"
                        autoFocus
                        spellCheck={false}
                    />
                </div>

                <div className="mt-12 h-16 flex justify-start">
                    {formData.role.trim() && (
                        <button
                            type="submit"
                            className="bg-[#d2e3fc] text-[#174ea6] hover:bg-[#c2d7fa] text-lg font-medium px-12 py-3 rounded-lg transition-all animate-fade-in"
                        >
                            Next
                        </button>
                    )}
                </div>
            </form>
        </div>
    );

    const renderStep2_Level = () => (
        <div className="animate-slide-up w-full max-w-4xl mx-auto">
            <h2 className="text-[32px] text-[#202124] font-normal mb-12">
                Got it. What's your experience level?
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {EXPERIENCE_LEVELS.map((level) => (
                    <button
                        key={level.id}
                        onClick={() => {
                            setFormData({ ...formData, experienceLevel: level.id });
                            handleNext();
                        }}
                        className="group relative p-6 bg-white border border-[#dadce0] rounded-2xl hover:border-[#1a73e8] hover:shadow-md transition-all text-left flex flex-col items-start"
                    >
                        <div className="text-xl font-medium text-[#202124] group-hover:text-[#1a73e8] mb-1">
                            {level.label}
                        </div>
                        <div className="text-sm text-[#5f6368]">
                            {level.sub}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep3_JD = () => (
        <div className="animate-slide-up w-full max-w-4xl mx-auto">
            <h2 className="text-[32px] text-[#202124] font-normal mb-2">
                Want to tailor this? Paste the Job Description.
            </h2>
            <p className="text-[#5f6368] mb-8 text-lg">
                I'll verify if your experience matches the requirements.
            </p>

            <textarea
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                placeholder="Paste job description here..."
                className="w-full h-64 bg-transparent text-xl text-[#202124] placeholder:text-[#dadce0] border-none focus:ring-0 focus:outline-none resize-none p-0 leading-relaxed"
                autoFocus
            />

            <div className="mt-8 flex items-center justify-start gap-6">
                <button
                    onClick={handleNext}
                    className="bg-[#d2e3fc] text-[#174ea6] hover:bg-[#c2d7fa] text-lg font-medium px-12 py-3 rounded-lg transition-all"
                >
                    Next
                </button>
                <button
                    onClick={handleSkip}
                    className="text-[#5f6368] hover:text-[#202124] font-medium transition-colors"
                >
                    Skip
                </button>
            </div>
        </div>
    );

    const renderStep4_Resume = () => (
        <div className="animate-slide-up w-full max-w-4xl mx-auto">
            <h2 className="text-[32px] text-[#202124] font-normal mb-2">
                Finally, share your Resume so I can personalize the questions.
            </h2>
            <p className="text-[#5f6368] mb-8 text-lg">
                I'll focus on your past projects and skills.
            </p>

            <textarea
                value={formData.resume}
                onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                placeholder="Paste resume text or summary here..."
                className="w-full h-64 bg-transparent text-xl text-[#202124] placeholder:text-[#dadce0] border-none focus:ring-0 focus:outline-none resize-none p-0 leading-relaxed"
                autoFocus
            />

            <div className="mt-8 flex items-center justify-start gap-6">
                <button
                    onClick={handleStartInterview}
                    className="bg-[#1a73e8] text-white hover:bg-[#1557b0] text-lg font-medium px-12 py-3 rounded-lg transition-all shadow-md hover:shadow-lg animate-pulse-subtle"
                >
                    Start Interview
                </button>
                <button
                    onClick={handleStartInterview}
                    className="text-[#5f6368] hover:text-[#202124] font-medium transition-colors"
                >
                    Skip
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-[#f8f9fa]/90 backdrop-blur-sm">
                <button
                    onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
                    className="flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {step > 1 ? 'Back' : 'Cancel'}
                </button>

                {/* Progress Indicators */}
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-[#1a73e8]' :
                                s < step ? 'w-2 bg-[#1a73e8]/40' : 'w-2 bg-[#dadce0]'
                                }`}
                        />
                    ))}
                </div>

                <div className="w-20" /> {/* Spacer */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
                {step === 1 && renderStep1_Role()}
                {step === 2 && renderStep2_Level()}
                {step === 3 && renderStep3_JD()}
                {step === 4 && renderStep4_Resume()}
            </main>
        </div>
    );
}
