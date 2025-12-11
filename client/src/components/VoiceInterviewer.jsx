import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Keyboard, Lightbulb } from 'lucide-react';
import Visualizer from './Visualizer';

export default function VoiceInterviewer({ role = 'General Interview', initialData = {} }) {
    const [step, setStep] = useState('intro'); // intro -> idle -> active
    const [status, setStatus] = useState('Ready');
    const [error, setError] = useState(null);

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

    async function startSession() {
        try {
            setStatus('Connecting...');
            setError(null);

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
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setStep('idle');
        setStatus('Ready');
    }

    if (step === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-6xl mb-6 animate-wave origin-bottom-right">👋</div>
                <h2 className="text-[32px] font-normal text-[#202124] text-center">
                    Hi! Let's practice an interview for <span className="font-medium">{role}</span>.
                </h2>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto animate-slide-up">
            <div className="bg-white rounded-[24px] p-10 shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] min-h-[400px] flex flex-col justify-between relative overflow-hidden">

                {/* Header / Question Area */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="bg-[#e8f0fe] text-[#1967d2] px-3 py-1 rounded-md text-sm font-medium">
                            Background question
                        </span>
                        <span className="text-[#5f6368] text-sm font-medium">1/5</span>
                    </div>

                    <h3 className="text-[28px] leading-snug text-[#202124] font-normal">
                        Tell me a little about yourself.
                    </h3>
                </div>

                {/* Visualizer Area */}
                <div className="flex-1 flex items-center justify-center py-12">
                    <Visualizer isActive={step === 'active'} />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    {step === 'idle' ? (
                        <button
                            onClick={startSession}
                            className="flex-1 bg-white border border-[#dadce0] hover:bg-[#f8f9fa] text-[#1a73e8] h-14 rounded-full flex items-center justify-center gap-3 text-lg font-medium transition-all hover:shadow-sm group"
                        >
                            <Mic className="w-6 h-6 text-[#1a73e8]" />
                            Answer
                        </button>
                    ) : (
                        <button
                            onClick={stopSession}
                            className="flex-1 bg-[#ea4335] hover:bg-[#d93025] text-white h-14 rounded-full flex items-center justify-center gap-3 text-lg font-medium transition-all shadow-md"
                        >
                            <Square className="w-5 h-5 fill-current" />
                            End Answer
                        </button>
                    )}

                    {/* Secondary Actions (Visual only for now) */}
                    <button className="w-14 h-14 border border-[#dadce0] rounded-full flex items-center justify-center hover:bg-[#f8f9fa] text-[#1a73e8] transition-colors">
                        <Keyboard className="w-6 h-6" />
                    </button>
                    <button className="w-14 h-14 border border-[#dadce0] rounded-full flex items-center justify-center hover:bg-[#f8f9fa] text-[#1a73e8] transition-colors">
                        <Lightbulb className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="absolute bottom-4 left-0 right-0 text-center text-red-500 text-sm">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
