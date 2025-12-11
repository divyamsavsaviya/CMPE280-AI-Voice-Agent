import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Mic from 'lucide-react/dist/esm/icons/mic';
import Square from 'lucide-react/dist/esm/icons/square';
import Keyboard from 'lucide-react/dist/esm/icons/keyboard';
import Lightbulb from 'lucide-react/dist/esm/icons/lightbulb';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Visualizer from './Visualizer';

export default function VoiceInterviewer({ role = 'General Interview', initialData = {} }) {
    const navigate = useNavigate();
    const [step, setStep] = useState('intro'); // intro -> idle -> active
    const [status, setStatus] = useState('Ready');
    const [error, setError] = useState(null);

    const [transcript, setTranscript] = useState([]);
    const transcriptRef = useRef([]);

    const peerConnection = useRef(null);
    const audioEl = useRef(null);
    const dataChannel = useRef(null);

    useEffect(() => {
        if (step === 'intro') {
            const timer = setTimeout(() => setStep('idle'), 2500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    useEffect(() => {
        return () => stopSession();
    }, []);

    const updateTranscript = (role, text) => {
        const currentList = transcriptRef.current;
        const lastItem = currentList[currentList.length - 1];

        if (lastItem && lastItem.role === role) {
            // MERGE: Append text to the last item if same speaker
            lastItem.text += ' ' + text;
            // distinct update to trigger re-render
            setTranscript([...currentList]);
        } else {
            // NEW ITEM
            const newItem = { role, text, timestamp: Date.now() };
            transcriptRef.current = [...currentList, newItem];
            setTranscript(transcriptRef.current);
        }

        // Auto-Save Safety
        localStorage.setItem('current_session_backup', JSON.stringify(transcriptRef.current));
    };

    async function startSession() {
        try {
            setStatus('Connecting...');
            setError(null);

            // Save context for the report
            localStorage.setItem('interview_role', role);
            if (initialData.experienceLevel) {
                localStorage.setItem('interview_experience', initialData.experienceLevel);
            }

            const tokenResponse = await fetch('/api/session/ephemeral-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, ...initialData }),
            });

            if (!tokenResponse.ok) throw new Error('Failed to get ephemeral key');

            const data = await tokenResponse.json();
            const EPHEMERAL_KEY = data.client_secret.value;

            peerConnection.current = new RTCPeerConnection();

            audioEl.current = document.createElement('audio');
            audioEl.current.autoplay = true;
            peerConnection.current.ontrack = (e) => {
                audioEl.current.srcObject = e.streams[0];
            };

            const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
            peerConnection.current.addTrack(ms.getTracks()[0]);

            dataChannel.current = peerConnection.current.createDataChannel('oai-events');

            // Real-time Event Listener
            dataChannel.current.onmessage = (e) => {
                try {
                    const event = JSON.parse(e.data);

                    if (event.type === 'conversation.item.input_audio_transcription.completed') {
                        // User's speech
                        const text = event.transcript;
                        if (text) updateTranscript('user', text);
                    } else if (event.type === 'response.audio_transcript.done') {
                        // AI's speech
                        const text = event.transcript;
                        if (text) updateTranscript('assistant', text);
                    }
                } catch (err) {
                    console.error('Error parsing event:', err);
                }
            };

            // Kick-off the conversation
            dataChannel.current.onopen = () => {
                const responseCreate = {
                    type: 'response.create',
                    response: {
                        modalities: ['text', 'audio'],
                    }
                };
                dataChannel.current.send(JSON.stringify(responseCreate));
            };

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            const baseUrl = 'https://api.openai.com/v1/realtime';
            const model = 'gpt-4o-realtime-preview-2024-10-01';
            const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
                method: 'POST',
                body: offer.sdp,
                headers: {
                    Authorization: `Bearer ${EPHEMERAL_KEY}`,
                    'Content-Type': 'application/sdp',
                },
            });

            const answer = { type: 'answer', sdp: await sdpResponse.text() };
            await peerConnection.current.setRemoteDescription(answer);

            setStep('active');
            setStatus('Connected');
        } catch (err) {
            console.error('Failed to start session:', err);
            setError(err.message);
            setStatus('Error');
            stopSession();
        }
    }

    function stopSession() {
        // Session Conclusion: Save full transcript and clear backup
        // Session Conclusion: Save full transcript and clear backup
        if (transcriptRef.current.length > 0) {
            const data = JSON.stringify(transcriptRef.current);
            localStorage.setItem(`completed_session_${Date.now()}`, data);
            localStorage.setItem('interview_transcript', data); // For the feedback page
            localStorage.removeItem('current_session_backup');
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setStep('idle');
        setStatus('Ready');
    }

    // ... (imports remain the same)

    // ... (component definition and hooks remain the same)

    // ... (useEffect and helper functions remain the same)

    // ... (startSession and stopSession functions remain the same)

    if (step === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-6xl mb-6 animate-wave origin-bottom-right" aria-hidden="true">👋</div>
                <h2 className="text-[32px] font-normal text-[#202124] text-center">
                    Hi! Let's practice an interview for <span className="font-medium">{role}</span>.
                </h2>
            </div>
        );
    }

    // Get the last item to display as a subtitle
    const lastItem = transcript.length > 0 ? transcript[transcript.length - 1] : null;

    return (
        <div className="w-full max-w-3xl mx-auto animate-slide-up">
            <div className="bg-white rounded-[24px] p-10 shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] min-h-[400px] flex flex-col justify-between relative overflow-hidden">

                {/* Header / Question Area */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="bg-[#e8f0fe] text-[#1967d2] px-3 py-1 rounded-md text-sm font-medium">
                            Phone Screen
                        </span>
                    </div>

                    <h1 className="text-[28px] leading-snug text-[#202124] font-normal">
                        Tell me a little about yourself.
                    </h1>
                </div>

                {/* Visualizer Area */}
                <div className="flex-1 flex flex-col items-center justify-center py-8" aria-hidden="true">
                    <Visualizer isActive={step === 'active'} />

                    {/* Live Subtitles */}
                    <div className="mt-8 min-h-[60px] flex items-center justify-center text-center px-4 w-full" aria-live="polite" aria-atomic="true">
                        {step === 'active' && lastItem && (
                            <div className="animate-fade-in max-w-2xl">
                                {lastItem.role === 'user' ? (
                                    <p className="text-2xl font-medium text-blue-600">
                                        <span className="text-sm uppercase tracking-wide opacity-70 block mb-1 text-center">You said</span>
                                        "{lastItem.text}"
                                    </p>
                                ) : (
                                    <p className="text-2xl font-medium text-gray-600">
                                        {lastItem.text}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    {step === 'idle' ? (
                        <button
                            onClick={startSession}
                            className="flex-1 bg-white border border-[#dadce0] hover:bg-[#f8f9fa] text-[#1a73e8] h-14 rounded-full flex items-center justify-center gap-3 text-lg font-medium transition-all hover:shadow-sm group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label="Start recording answer"
                        >
                            <Mic className="w-6 h-6 text-[#1a73e8]" aria-hidden="true" />
                            Answer
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                stopSession();
                                navigate('/feedback');
                            }}
                            className="flex-1 bg-[#ea4335] hover:bg-[#d93025] text-white h-14 rounded-full flex items-center justify-center gap-3 text-lg font-medium transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            aria-label="Stop interview and view report"
                        >
                            <Square className="w-5 h-5 fill-current" aria-hidden="true" />
                            End Interview
                        </button>
                    )}

                    {/* Secondary Actions (Visual only for now) */}
                    <button
                        className="w-14 h-14 border border-[#dadce0] rounded-full flex items-center justify-center hover:bg-[#f8f9fa] text-[#1a73e8] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Open keyboard input"
                    >
                        <Keyboard className="w-6 h-6" aria-hidden="true" />
                    </button>
                    <button
                        className="w-14 h-14 border border-[#dadce0] rounded-full flex items-center justify-center hover:bg-[#f8f9fa] text-[#1a73e8] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Get a hint"
                    >
                        <Lightbulb className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>

                {error && (
                    <div className="absolute bottom-4 left-0 right-0 text-center text-red-500 text-sm" role="alert">
                        {error}
                    </div>
                )}
            </div>
        </div >
    );
}
