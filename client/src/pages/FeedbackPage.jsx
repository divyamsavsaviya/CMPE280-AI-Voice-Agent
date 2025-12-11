import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, AlertTriangle, AlertCircle, ArrowLeft, Loader2, Award, Zap, Brain } from 'lucide-react';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

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
                    throw new Error('Failed to fetch analysis');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">Analyzing your interview...</h2>
                <p className="text-gray-500 mt-2">Our AI coach is reviewing your answers.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Analysis Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Post-Interview Report</h1>
                        <p className="text-gray-500 mt-1">AI-driven analysis of your recent session</p>
                    </div>

                    <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 flex items-center gap-3">
                        <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Level Achieved</span>
                        <span className={`text-lg font-bold ${data?.competencyBand === 'Advanced' ? 'text-green-600' :
                                data?.competencyBand === 'Intermediate' ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                            {data?.competencyBand || 'Pending'}
                        </span>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        label="Confidence"
                        value={data?.confidenceScore}
                        icon={<Award className="w-6 h-6 text-purple-600" />}
                        color="text-purple-600"
                        bg="bg-purple-50"
                    />
                    <MetricCard
                        label="Clarity"
                        value={data?.clarity}
                        icon={<Zap className="w-6 h-6 text-yellow-600" />}
                        color="text-yellow-600"
                        bg="bg-yellow-50"
                    />
                    <MetricCard
                        label="Knowledge Depth"
                        value={data?.knowledgeDepth}
                        icon={<Brain className="w-6 h-6 text-blue-600" />}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                </div>

                {/* Traffic Light Feedback */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Detailed Feedback</h2>

                    <div className="grid gap-4">
                        {/* Green / Success */}
                        {data?.feedbackPoints?.filter(f => f.type === 'success').map((point, idx) => (
                            <FeedbackCard key={`success-${idx}`} type="success" title={point.title} description={point.description} />
                        ))}

                        {/* Yellow / Warning */}
                        {data?.feedbackPoints?.filter(f => f.type === 'warning').map((point, idx) => (
                            <FeedbackCard key={`warning-${idx}`} type="warning" title={point.title} description={point.description} />
                        ))}

                        {/* Red / Critical */}
                        {data?.feedbackPoints?.filter(f => f.type === 'critical').map((point, idx) => (
                            <FeedbackCard key={`critical-${idx}`} type="critical" title={point.title} description={point.description} />
                        ))}
                    </div>
                </div>

                {/* STAR Method Check */}
                {data?.starMethod !== undefined && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">STAR Method Usage</h3>
                            <p className="text-gray-500 text-sm">Did you follow the Situation-Task-Action-Result format?</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold bg-gray-50 ${data.starMethod ? 'text-green-600' : 'text-orange-500'}`}>
                            {data.starMethod ? 'Yes, well done!' : 'Needs Improvement'}
                        </div>
                    </div>
                )}

                {/* Coach's Note */}
                <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                    <h3 className="text-blue-900 font-bold text-lg mb-2 flex items-center gap-2">
                        <span className="bg-blue-200 p-1.5 rounded-md">💡</span> Coach's Note
                    </h3>
                    <p className="text-blue-800 text-lg leading-relaxed">
                        "{data?.coachNote}"
                    </p>
                </div>

            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, color, bg }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
        <div className={`p-4 rounded-xl ${bg}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-extrabold ${color}`}>{value}%</p>
        </div>
    </div>
);

const FeedbackCard = ({ type, title, description }) => {
    const styles = {
        success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <BadgeCheck className="w-6 h-6 text-green-600 flex-shrink-0" /> },
        warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" /> },
        critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" /> },
    };

    const s = styles[type];

    return (
        <div className={`${s.bg} border ${s.border} p-5 rounded-xl flex gap-4 items-start`}>
            <div className="mt-1">{s.icon}</div>
            <div>
                <h4 className={`font-bold ${s.text} text-lg`}>{title}</h4>
                <p className={`${s.text} opacity-90 leading-relaxed`}>{description}</p>
            </div>
        </div>
    );
};

export default FeedbackPage;
