import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoleSelectionPage from './pages/RoleSelectionPage';

describe('HomePage', () => {
    it('renders title and start button', () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
        expect(screen.getByRole('heading', { name: /interview/i })).toBeInTheDocument();
        expect(screen.getByText(/warmup/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start practicing/i })).toBeInTheDocument();
    });

    it('navigates to /roles when start button is clicked', () => {
        let testLocation;
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/roles" element={<div>Roles Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        const startButton = screen.getByRole('button', { name: /start practicing/i });
        fireEvent.click(startButton);

        expect(screen.getByText('Roles Page')).toBeInTheDocument();
    });
});

describe('RoleSelectionPage', () => {
    it('renders input field', () => {
        render(
            <MemoryRouter>
                <RoleSelectionPage />
            </MemoryRouter>
        );
        // The input has an aria-label "Enter your current or previous role"
        expect(screen.getByLabelText(/enter your current or previous role/i)).toBeInTheDocument();
    });

    it('updates state when typing in role', () => {
        render(
            <MemoryRouter>
                <RoleSelectionPage />
            </MemoryRouter>
        );
        const input = screen.getByLabelText(/enter your current or previous role/i);
        fireEvent.change(input, { target: { value: 'Frontend Developer' } });
        expect(input.value).toBe('Frontend Developer');
    });

    it('shows Next button only after input', () => {
        render(
            <MemoryRouter>
                <RoleSelectionPage />
            </MemoryRouter>
        );
        const input = screen.getByLabelText(/enter your current or previous role/i);

        // Button should not be visible initially
        const nextButtonQuery = screen.queryByRole('button', { name: /next/i });
        expect(nextButtonQuery).not.toBeInTheDocument();

        // Type something
        fireEvent.change(input, { target: { value: 'D' } });

        // Button should appear
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeInTheDocument();
    });
});
