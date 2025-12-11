import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import VoiceInterviewer from '../components/VoiceInterviewer';

const ROLE_LABELS = {
    'data-analytics': 'Data Analytics',
    'digital-marketing': 'Digital Marketing',
    'it-support': 'IT Support',
    'project-management': 'Project Management',
    'ux-design': 'UX Design',
    'cybersecurity': 'Cybersecurity',
    'general': 'General Interview',
};

export default function InterviewPage() {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const roleLabel = decodeURIComponent(roleId || 'General Interview');
    const additionalContext = location.state || {}; // { role, experienceLevel, jobDescription, resume }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/roles')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">{roleLabel}</span>
                </button>
                <h1 className="text-xl font-normal text-gray-900">
                    interview <span className="text-blue-600 font-medium">warmup</span>
                </h1>
                <div className="w-20" /> {/* Spacer */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <VoiceInterviewer role={roleLabel} initialData={additionalContext} />
            </main>
        </div>
    );
}
