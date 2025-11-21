import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import InterviewPage from './pages/InterviewPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/roles" element={<RoleSelectionPage />} />
                <Route path="/interview/:roleId" element={<InterviewPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
