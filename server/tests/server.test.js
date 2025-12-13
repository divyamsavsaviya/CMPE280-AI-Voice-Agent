const request = require('supertest');
const express = require('express');
const cors = require('cors');
const sessionRoute = require('../routes/session');

// Mock dotenv
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/session', sessionRoute);

// Mock Health Route
app.get('/health', (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

describe('Server Endpoints', () => {

    it('GET /health should return status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });

    // Mocking fetch for OpenAI API interaction
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ client_secret: { value: "test_secret" } }),
        })
    );

    it('POST /api/session/ephemeral-key should return a key', async () => {
        const res = await request(app)
            .post('/api/session/ephemeral-key')
            .send({
                role: 'Engineer',
                experienceLevel: 'Senior',
                jobDescription: 'React Dev',
                resume: 'Experienced'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('client_secret');
    });

    it('POST /api/session/ephemeral-key should handle OpenAI errors', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                text: () => Promise.resolve("Internal Server Error"),
            })
        );

        const res = await request(app)
            .post('/api/session/ephemeral-key')
            .send({});

        expect(res.statusCode).toEqual(500);
    });
});

describe('Feedback Endpoints', () => {
    // Add feedback route validation
    const feedbackRoute = require('../routes/feedback');
    app.use('/api/feedback', feedbackRoute);

    it('POST /api/feedback/analyze should return 400 for missing transcript', async () => {
        const res = await request(app)
            .post('/api/feedback/analyze')
            .send({}); // Empty body

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Valid transcript array is required');
    });

    it('POST /api/feedback/analyze should return 400 for no candidate speech', async () => {
        const res = await request(app)
            .post('/api/feedback/analyze')
            .send({
                transcript: [
                    { role: 'assistant', content: 'Hello' }
                ]
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'insufficient_data');
    });

    it('POST /api/feedback/analyze should return analysis for valid transcript', async () => {
        const mockAnalysis = {
            confidenceScore: 85,
            competencyBand: "Intermediate",
            starMethod: true,
            clarity: 90,
            knowledgeDepth: 80,
            feedbackPoints: [],
            coachNote: "Good job",
            annotatedConversation: []
        };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{
                        message: {
                            content: JSON.stringify(mockAnalysis)
                        }
                    }]
                }),
            })
        );

        const res = await request(app)
            .post('/api/feedback/analyze')
            .send({
                role: 'Developer',
                transcript: [
                    { role: 'user', content: 'I built a React app.' }
                ]
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockAnalysis);
    });
});
