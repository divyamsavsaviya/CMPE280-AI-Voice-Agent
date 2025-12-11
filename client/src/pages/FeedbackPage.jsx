import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, AlertTriangle, AlertCircle, ArrowLeft, Loader2, Award, Zap, Brain } from 'lucide-react';
import SmartTranscript from '../components/SmartTranscript';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(true);
    const [selfScore, setSelfScore] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const transcriptRaw = localStorage.getItem('interview_transcript');
                const role = localStorage.getItem('interview_role');
                const experienceLevel = localStorage.getItem('interview_experience');

                if (!transcriptRaw) {
                    // For dev testing, if no transcript, maybe show mock data or redirect?
                    // redirecting for now
                    // navigate('/');
                    // return;
                }

                const transcript = transcriptRaw ? JSON.parse(transcriptRaw) : [];

                if (transcript.length === 0) {
                    setError("No interview transcript found. Please complete an interview first.");
                    setLoading(false);
                    return;
                }

                const res = await fetch('http://localhost:3001/api/feedback/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transcript,
                        role,
                        experienceLevel
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || errData.error || 'Failed to fetch analysis');
                }

                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error(err);
                setError("Failed to generate report. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleReflectionSubmit = (score) => {
        setSelfScore(score);
        setTimeout(() => setShowModal(false), 500); // Small delay for animation
    };

    // Render loading state ONLY if modal is closed AND we are still loading
    if (!showModal && loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in" role="status" aria-busy="true">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-gray-800">Finalizing your report...</h2>
                <p className="text-gray-500 mt-2">Almost there!</p>
            </div>
        );
    }

    // If error, we still want to render the page to show the raw transcript
    // We just won't show the analytics
    const isError = !!error || data?.error === 'insufficient_data';

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans relative">

            {/* REFLECTION MODAL */}
            {showModal && (
                <ReflectionModal onSubmit={handleReflectionSubmit} />
            )}

            {/* Sticky Header */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-[#f8f9fa]/90 backdrop-blur-sm">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    aria-label="Back to Home"
                >
                    <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                    Back to Home
                </button>
                {/* Optional: Add a simple logo or title here if needed, or keep clean */}
                <div className="w-20" />
            </header>

            <main className={`flex-1 w-full max-w-5xl mx-auto px-6 pb-20 animate-slide-up ${showModal ? 'blur-sm pointer-events-none overflow-hidden h-screen' : ''}`} aria-hidden={showModal}>

                {/* Title Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-[40px] leading-tight font-normal text-[#202124] mb-3">
                        Interview Report
                    </h1>
                    {!isError && (
                        <div className="inline-flex items-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-[#dadce0]">
                            <span className="text-sm text-[#5f6368] font-medium uppercase tracking-wider">Level</span>
                            <span className={`text-lg font-bold ${data?.competencyBand === 'Advanced' ? 'text-[#188038]' :
                                data?.competencyBand === 'Intermediate' ? 'text-[#1a73e8]' : 'text-[#5f6368]'
                                }`}>
                                {data?.competencyBand || 'Pending'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Error Banner */}
                {isError && (
                    <div className="bg-[#fce8e6] border border-[#f9d3d3] rounded-2xl p-8 text-center mb-8 max-w-3xl mx-auto" role="alert">
                        <div className="w-16 h-16 bg-[#fff8eb] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl" aria-hidden="true">⚠️</span>
                        </div>
                        <h2 className="text-xl font-medium text-[#c5221f] mb-2">Analysis Unavailable</h2>
                        <p className="text-[#3c4043] leading-relaxed">
                            {error || "We couldn't generate a full report due to insufficient speech data, but here is what we recorded."}
                        </p>
                    </div>
                )}

                {/* Metrics Grid */}
                {!isError && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <MetricCard
                            label="Confidence"
                            value={data?.confidenceScore}
                            selfValue={selfScore ? selfScore * 10 : null} // Convert 1-10 to %
                            icon={<Award className="w-8 h-8 text-[#9334e6]" aria-hidden="true" />}
                            color="text-[#9334e6]"
                            bg="bg-[#f3e8fd]"
                        />
                        <MetricCard
                            label="Clarity"
                            value={data?.clarity}
                            icon={<Zap className="w-8 h-8 text-[#ea8600]" aria-hidden="true" />}
                            color="text-[#ea8600]"
                            bg="bg-[#fef7e0]"
                        />
                        <MetricCard
                            label="Knowledge"
                            value={data?.knowledgeDepth}
                            icon={<Brain className="w-8 h-8 text-[#1a73e8]" aria-hidden="true" />}
                            color="text-[#1a73e8]"
                            bg="bg-[#e8f0fe]"
                        />
                    </div>
                )}

                {/* Main Content Area */}
                <div className="space-y-8">

                    {/* Transcript Card */}
                    <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-sm border border-[#dadce0]">
                        <h2 className="text-[28px] font-normal text-[#202124] mb-6">Transcript Analysis</h2>

                        {data?.annotatedConversation ? (
                            <SmartTranscript conversation={data.annotatedConversation} />
                        ) : (
                            <div className="text-lg leading-relaxed text-[#3c4043]">
                                {/* Fallback for raw transcript - BUT GROUPED! */}
                                <SmartTranscript conversation={(() => {
                                    const raw = JSON.parse(localStorage.getItem('interview_transcript') || '[]');
                                    if (raw.length === 0) return [];

                                    // Client-side grouping fallback
                                    const grouped = [];
                                    if (raw.length > 0) {
                                        let current = { ...raw[0] };
                                        for (let i = 1; i < raw.length; i++) {
                                            if (raw[i].role === current.role) {
                                                current.content = (current.content || current.text || '') + ' ' + (raw[i].content || raw[i].text || '');
                                            } else {
                                                grouped.push(current);
                                                current = { ...raw[i] };
                                            }
                                        }
                                        grouped.push(current);
                                    }

                                    // Normalize content/text field
                                    return grouped.map(m => ({
                                        role: m.role,
                                        content: m.content || m.text || ''
                                    }));
                                })()} />

                                {(!localStorage.getItem('interview_transcript') || JSON.parse(localStorage.getItem('interview_transcript')).length === 0) && (
                                    <p className="text-[#5f6368] italic">No speech recorded.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Detailed Feedback & Coach Note */}
                    {!isError && (
                        <>
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Feedback Points */}
                                <div className="space-y-4">
                                    <h2 className="text-[24px] font-normal text-[#202124] mb-4 pl-2">Key Feedback</h2>
                                    {data?.feedbackPoints?.map((point, idx) => (
                                        <FeedbackCard key={idx} type={point.type} title={point.title} description={point.description} />
                                    ))}
                                </div>

                                {/* Coach Note & STAR */}
                                <div className="space-y-6">
                                    {/* Coach's Note */}
                                    <div className="bg-[#e8f0fe] rounded-[24px] p-8 border border-[#d2e3fc]">
                                        <h3 className="text-[#174ea6] font-medium text-lg mb-4 flex items-center gap-2">
                                            <div className="bg-white p-1.5 rounded-lg shadow-sm" aria-hidden="true">💡</div> Coach's Note
                                        </h3>
                                        <p className="text-[#174ea6] text-xl leading-relaxed font-normal">
                                            "{data?.coachNote}"
                                        </p>
                                    </div>

                                    {/* STAR Method */}
                                    {data?.starMethod !== undefined && (
                                        <div className="bg-white rounded-[24px] p-8 border border-[#dadce0] flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-[#202124]">STAR Method</h3>
                                                <p className="text-[#5f6368] text-sm mt-1">Structured Answer Format</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full font-medium ${data.starMethod ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                                                {data.starMethod ? 'Followed' : 'Missed'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
};

const ReflectionModal = ({ onSubmit }) => {
    const [score, setScore] = useState(5);
    const [note, setNote] = useState('');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reflection-title"
        >
            <div className="bg-white rounded-[24px] shadow-2xl max-w-lg w-full p-8 animate-scale-in border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" aria-hidden="true">
                        🤔
                    </div>
                    <h2 id="reflection-title" className="text-2xl font-normal text-[#202124]">Self-Reflection</h2>
                    <p className="text-[#5f6368] mt-2">While our AI analyzes your session, how do <b>you</b> think it went?</p>
                </div>

                <div className="space-y-8">
                    {/* Confidence Slider */}
                    <div>
                        <label htmlFor="confidence-slider" className="block text-sm font-medium text-gray-700 mb-4 text-center">
                            Confidence Level: <span className="text-[#1a73e8] font-bold text-lg ml-1">{score}/10</span>
                        </label>
                        <input
                            id="confidence-slider"
                            type="range"
                            min="1"
                            max="10"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1a73e8]"
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-2 px-1" aria-hidden="true">
                            <span>Nu uh</span>
                            <span>Aced it</span>
                        </div>
                    </div>

                    {/* Optional Note */}
                    <div>
                        <label htmlFor="reflection-note" className="block text-sm font-medium text-gray-700 mb-2">
                            What went well? (Optional)
                        </label>
                        <textarea
                            id="reflection-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="I explained the technical concepts clearly..."
                            className="w-full p-4 border border-[#dadce0] rounded-xl focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100 transition outline-none resize-none text-gray-700 bg-gray-50 h-24"
                        />
                    </div>

                    <button
                        onClick={() => onSubmit(score)}
                        className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-3.5 rounded-full transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        See AI Feedback
                    </button>

                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, selfValue, icon, color, bg }) => (
    <div className="bg-white p-8 rounded-[24px] border border-[#dadce0] flex flex-col items-center text-center transition hover:border-[#1a73e8] hover:shadow-md relative overflow-hidden">

        {/* Connection Line / Comparison */}
        {selfValue && label === 'Confidence' && (
            <div className="absolute top-4 right-4 flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">You vs AI</span>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-gray-400">{selfValue}%</span>
                    <span className="text-gray-300">/</span>
                    <span className={`text-sm font-bold ${color}`}>{value}%</span>
                </div>
            </div>
        )}

        <div className={`p-4 rounded-full ${bg} mb-4`}>
            {icon}
        </div>
        <p className="text-[#5f6368] text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-[42px] font-normal ${color}`}>{value}%</p>
    </div>
);

const FeedbackCard = ({ type, title, description }) => {
    const styles = {
        success: { bg: 'bg-[#e6f4ea]', border: 'border-transparent', text: 'text-[#0d652d]', icon: <BadgeCheck className="w-6 h-6 text-[#188038]" aria-hidden="true" /> },
        warning: { bg: 'bg-[#fef7e0]', border: 'border-transparent', text: 'text-[#b06000]', icon: <AlertTriangle className="w-6 h-6 text-[#ea8600]" aria-hidden="true" /> },
        critical: { bg: 'bg-[#fce8e6]', border: 'border-transparent', text: 'text-[#c5221f]', icon: <AlertCircle className="w-6 h-6 text-[#d93025]" aria-hidden="true" /> },
    };

    const s = styles[type];

    return (
        <div className={`bg-white border border-[#dadce0] p-6 rounded-[20px] flex gap-4 items-start shadow-sm`}>
            <div className={`mt-0.5 p-2 rounded-full ${s.bg}`}>{s.icon}</div>
            <div>
                <h4 className={`font-medium text-[#202124] text-lg mb-1`}>{title}</h4>
                <p className="text-[#5f6368] leading-relaxed text-sm">{description}</p>
            </div>
        </div>
    );
};

export default FeedbackPage;
