import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import InterviewPage from './pages/InterviewPage';
import FeedbackPage from './pages/FeedbackPage';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/roles" element={<RoleSelectionPage />} />
                    <Route path="/interview/:roleId" element={<InterviewPage />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
