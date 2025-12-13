import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Since I don't know the exact content, I'll just check if it renders.
        // Usually we look for a title or main element.
        // Assuming there is some content, screen.debug() would show it.
        // For now, just passing render is a good smoke test.
    });
});
