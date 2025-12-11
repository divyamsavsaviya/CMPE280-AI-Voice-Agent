import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';

// Lazy load components
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));

// Loading component
const Loading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/roles" element={<RoleSelectionPage />} />
                        <Route path="/interview/:roleId" element={<InterviewPage />} />
                        <Route path="/feedback" element={<FeedbackPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </div>
        </BrowserRouter>
    );
}

export default App;
