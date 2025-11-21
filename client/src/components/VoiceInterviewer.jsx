import React, { useEffect, useRef, useState } from 'react';
import ControlPanel from './ControlPanel';

export default function VoiceInterviewer() {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState('Ready');
    const [error, setError] = useState(null);

    const peerConnection = useRef(null);
    const audioEl = useRef(null);
    const dataChannel = useRef(null);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopSession();
        };
    }, []);

    async function startSession() {
        try {
            setStatus('Connecting...');
            setError(null);

            // 1. Get ephemeral key from our backend
            const tokenResponse = await fetch('/api/session/ephemeral-key', {
                method: 'POST',
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to get ephemeral key');
            }

            const data = await tokenResponse.json();
            const EPHEMERAL_KEY = data.client_secret.value;

            // 2. Initialize WebRTC
            peerConnection.current = new RTCPeerConnection();

            // Set up audio element for playback
            audioEl.current = document.createElement('audio');
            audioEl.current.autoplay = true;
            peerConnection.current.ontrack = (e) => {
                audioEl.current.srcObject = e.streams[0];
            };

            // 3. Add local microphone track
            const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
            peerConnection.current.addTrack(ms.getTracks()[0]);

            // 4. Create Data Channel for events
            dataChannel.current = peerConnection.current.createDataChannel('oai-events');
            dataChannel.current.addEventListener('message', (e) => {
                try {
                    const event = JSON.parse(e.data);
                    console.log('Received event:', event);
                    // Handle events like 'response.audio_transcript.done' here for UI updates
                } catch (err) {
                    console.error('Error parsing event:', err);
                }
            });

            // 5. Create Offer and Set Local Description
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            // 6. Connect to OpenAI Realtime API
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

            const answer = {
                type: 'answer',
                sdp: await sdpResponse.text(),
            };

            await peerConnection.current.setRemoteDescription(answer);

            setIsSessionActive(true);
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
        setIsSessionActive(false);
        setStatus('Ready');
    }

    return (
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="flex flex-col items-center gap-6">
                {/* Status Indicator */}
                <div className={`px-4 py-1 rounded-full text-sm font-medium ${status === 'Connected' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                        status === 'Error' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                            'bg-gray-700 text-gray-300'
                    }`}>
                    {status}
                </div>

                {/* Visualizer Placeholder */}
                <div className="w-full h-48 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-800 relative overflow-hidden">
                    {isSessionActive ? (
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-2 h-12 bg-blue-500 rounded-full animate-pulse-slow" style={{ animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-600">Start interview to activate</span>
                    )}
                </div>

                {error && (
                    <div className="text-red-400 text-sm text-center max-w-md">
                        {error}
                    </div>
                )}

                <ControlPanel
                    isSessionActive={isSessionActive}
                    onStartSession={startSession}
                    onStopSession={stopSession}
                />
            </div>
        </div>
    );
}
