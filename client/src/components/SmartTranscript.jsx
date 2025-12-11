import React, { useState } from 'react';

// Simple tooltip component
// Helper to identify and parse <mark> tags inside a string
const parseContent = (htmlString) => {
    const regex = /<mark\s+type="([^"]+)"(?:\s+suggestion="([^"]*)")?>([\s\S]*?)<\/mark>|([^<]+)/g;
    const parts = [];
    let match;

    while ((match = regex.exec(htmlString)) !== null) {
        if (match[0].startsWith('<mark')) {
            parts.push({
                type: 'mark',
                markType: match[1],
                suggestion: match[2],
                content: match[3]
            });
        } else if (match[4]) {
            parts.push({
                type: 'text',
                content: match[4]
            });
        }
    }
    return parts;
};

// Tooltip Component
const Tooltip = ({ text, children }) => (
    <div className="group relative inline-block">
        {children}
        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-xl pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
    </div>
);

// Sub-component for rendering a single message bubble
const MessageBubble = ({ role, content, parts }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`
                relative px-6 py-4 rounded-3xl max-w-[80%] text-lg leading-relaxed shadow-sm
                ${isUser ? 'bg-[#e8f0fe] text-[#1f1f1f] rounded-tr-sm' : 'bg-[#f1f3f4] text-[#1f1f1f] rounded-tl-sm'}
            `}>
                {/* Regular Text (Interviewer) */}
                {!parts && (
                    <span>{content}</span>
                )}

                {/* Annotated Text (User) */}
                {parts && (
                    <span>
                        {parts.map((part, idx) => {
                            if (part.type === 'text') {
                                return <span key={idx}>{part.content}</span>;
                            }

                            const { markType, suggestion, content } = part;

                            if (markType === 'filler') {
                                return (
                                    <Tooltip key={idx} text="Filler word">
                                        <span className="bg-[#fef7e0] text-[#b06000] border-b border-[#fef7e0] hover:border-[#b06000] mx-0.5 rounded px-1 transition-colors cursor-help">
                                            {content}
                                        </span>
                                    </Tooltip>
                                );
                            }

                            if (markType === 'weak') {
                                return (
                                    <Tooltip key={idx} text={`Try: ${suggestion}`}>
                                        <span className="decoration-[#8ab4f8] decoration-2 underline underline-offset-4 cursor-help mx-0.5 text-[#202124] hover:bg-[#e8f0fe] rounded px-0.5 transition-colors">
                                            {content}
                                        </span>
                                    </Tooltip>
                                );
                            }

                            if (markType === 'critical') {
                                return (
                                    <Tooltip key={idx} text={suggestion || "Correction needed"}>
                                        <span className="bg-[#fce8e6] text-[#c5221f] decoration-wavy underline decoration-[#f28b82] cursor-help mx-0.5 px-1 rounded hover:bg-[#fad2cf] transition-colors">
                                            {content}
                                        </span>
                                    </Tooltip>
                                );
                            }

                            return <span key={idx}>{content}</span>;
                        })}
                    </span>
                )}
            </div>
        </div>
    );
};


const SmartTranscript = ({ conversation }) => {
    if (!conversation || !Array.isArray(conversation)) return null;

    return (
        <div className="flex flex-col space-y-2 font-sans">
            {conversation.map((msg, idx) => {
                // If it's the user, we try to parse it for marks. 
                // If assistant, we usually just show play text (unless specific prompt overrides).
                const parts = msg.role === 'user' ? parseContent(msg.content) : null;

                return (
                    <MessageBubble
                        key={idx}
                        role={msg.role}
                        content={msg.content}
                        parts={parts}
                    />
                );
            })}
        </div>
    );
};

export default SmartTranscript;
