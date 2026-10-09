import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isFeedback, isJobMatch, parseFeedback, parseResume } from '../app/lib/feedback.ts';
import { prepareInstructions } from '../constants/index.ts';

const valid = () => ({
    overallScore: 80,
    ATS: { score: 75, tips: [{ type: 'improve', tip: 'Add keywords' }] },
    ...Object.fromEntries(['toneAndStyle', 'content', 'structure', 'skills'].map((key) =>
        [key, { score: 80, tips: [{ type: 'good', tip: 'Clear', explanation: 'Easy to read' }] }])),
});

test('accepts complete feedback from string or multiple text blocks', () => {
    const json = JSON.stringify(valid());
    assert.deepEqual(parseFeedback(json), valid());
    assert.deepEqual(parseFeedback([{ text: json.slice(0, 30) }, { text: json.slice(30) }]), valid());
    assert.deepEqual(parseFeedback('```json\n' + json + '\n```'), valid());
});

test('rejects malformed output, missing categories, and invalid tips or scores', () => {
    for (const value of ['', 'not JSON', '{}', undefined, []]) {
        assert.throws(() => parseFeedback(value), /invalid feedback/);
    }
    for (const score of [-1, 101, NaN, Infinity, '80']) {
        const feedback = valid();
        feedback.overallScore = score;
        assert.equal(isFeedback(feedback), false);
    }
    const missing = valid();
    delete missing.skills;
    assert.equal(isFeedback(missing), false);
    const badTip = valid();
    badTip.content.tips[0].type = 'unknown';
    assert.equal(isFeedback(badTip), false);
    const noExplanation = valid();
    delete noExplanation.structure.tips[0].explanation;
    assert.equal(isFeedback(noExplanation), false);
});

test('rejects historical incomplete records instead of rendering false scores', () => {
    const resume = { id: 'example', resumePath: 'resume.pdf', imagePath: 'preview.jpg', feedback: valid() };
    assert.deepEqual(parseResume(JSON.stringify(resume)), resume);
    assert.throws(() => parseResume(JSON.stringify({ ...resume, feedback: '' })), /incomplete/);
    assert.throws(() => parseResume(JSON.stringify({ ...resume, imagePath: null })), /invalid/);
});

const match = () => ({
    score: 72, summary: 'React is demonstrated; testing experience needs clearer evidence.',
    requirements: [
        { requirement: 'React development', status: 'matched', evidence: 'Built a React dashboard.', priority: 'high', nextStep: 'Highlight this project in the experience section.' },
        { requirement: 'Automated testing', status: 'missing', evidence: 'Automated testing is not demonstrated in the resume.', priority: 'medium', nextStep: 'Add testing work only if you have done it.' },
    ],
    matchedKeywords: ['React'], missingKeywords: ['automated testing'],
});

test('accepts job matching and preserves it in saved records', () => {
    const feedback = { ...valid(), jobMatch: match() };
    assert.equal(isJobMatch(feedback.jobMatch), true);
    assert.deepEqual(parseFeedback(JSON.stringify(feedback), true), feedback);
    const resume = { id: 'match', resumePath: 'resume.pdf', imagePath: 'preview.jpg', jobDescription: 'React and automated testing', feedback };
    assert.deepEqual(parseResume(JSON.stringify(resume)), resume);
});

test('keeps legacy feedback compatible but requires job matching for new targeted analyses', () => {
    assert.deepEqual(parseFeedback(JSON.stringify(valid())), valid());
    assert.equal(isFeedback({ ...valid(), jobMatch: null }), true);
    assert.throws(() => parseFeedback(JSON.stringify(valid()), true), /invalid feedback/);
    assert.throws(() => parseFeedback(JSON.stringify({ ...valid(), jobMatch: null }), true), /invalid feedback/);
});

test('rejects malformed match scores, requirements, priorities, evidence, and keywords', () => {
    const invalid = [
        { ...match(), score: 101 }, { ...match(), score: '72' },
        { ...match(), requirements: [] }, { ...match(), summary: ' ' },
        { ...match(), matchedKeywords: [42] }, { ...match(), missingKeywords: null },
        { ...match(), requirements: [{ ...match().requirements[0], status: 'hired' }] },
        { ...match(), requirements: [{ ...match().requirements[0], priority: 'urgent' }] },
        { ...match(), requirements: [{ ...match().requirements[0], evidence: '' }] },
        { ...match(), requirements: [{ ...match().requirements[0], nextStep: null }] },
    ];
    for (const jobMatch of invalid) {
        assert.equal(isJobMatch(jobMatch), false);
        assert.throws(() => parseFeedback(JSON.stringify({ ...valid(), jobMatch })), /invalid feedback/);
    }
});

test('prompt uses the supplied description and does not infer requirements from a title alone', () => {
    const targeted = prepareInstructions({ jobTitle: 'Developer', jobDescription: 'React and automated testing' });
    assert.match(targeted, /Include a complete jobMatch object/);
    assert.match(targeted, /React and automated testing/);
    assert.match(targeted, /never invent experience/);
    const untargeted = prepareInstructions({ jobTitle: 'Developer', jobDescription: '   ' });
    assert.match(untargeted, /Set jobMatch to null/);
    assert.doesNotMatch(untargeted, /Include a complete jobMatch object/);
});
