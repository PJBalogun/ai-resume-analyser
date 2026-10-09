const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isScore = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export function isJobMatch(value: unknown): value is JobMatch {
    return isObject(value) && isScore(value.score) && isText(value.summary)
        && Array.isArray(value.requirements) && value.requirements.length > 0 && value.requirements.length <= 12
        && value.requirements.every((item: unknown) => isObject(item)
            && isText(item.requirement) && isText(item.evidence) && isText(item.nextStep)
            && ['matched', 'partial', 'missing'].includes(String(item.status))
            && ['high', 'medium', 'low'].includes(String(item.priority)))
        && Array.isArray(value.matchedKeywords) && value.matchedKeywords.every(isText)
        && Array.isArray(value.missingKeywords) && value.missingKeywords.every(isText);
}

export function isFeedback(value: unknown): value is Feedback {
    if (!isObject(value) || !isScore(value.overallScore)) return false;
    if (value.jobMatch !== undefined && value.jobMatch !== null && !isJobMatch(value.jobMatch)) return false;
    return ['ATS', 'toneAndStyle', 'content', 'structure', 'skills'].every((key) => {
        const category = value[key];
        return isObject(category) && isScore(category.score) && Array.isArray(category.tips)
            && category.tips.every((tip: unknown) => isObject(tip)
                && (tip.type === 'good' || tip.type === 'improve')
                && typeof tip.tip === 'string'
                && (key === 'ATS' || typeof tip.explanation === 'string'));
    });
}

export function parseFeedback(content: unknown, requireJobMatch = false): Feedback {
    const text = typeof content === 'string' ? content : Array.isArray(content)
        ? content.filter(isObject).map((block) => typeof block.text === 'string' ? block.text : '').join('')
        : '';
    try {
        const value: unknown = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
        if (isFeedback(value) && (!requireJobMatch || isJobMatch(value.jobMatch))) return value;
    } catch { /* Report one actionable error for invalid AI output. */ }
    throw new Error('The analysis returned invalid feedback. Please try again.');
}

export function parseResume(value: string): Resume {
    const data: unknown = JSON.parse(value);
    if (!isObject(data) || typeof data.id !== 'string'
        || typeof data.resumePath !== 'string' || typeof data.imagePath !== 'string'
        || !isFeedback(data.feedback)
        || (data.companyName !== undefined && typeof data.companyName !== 'string')
        || (data.jobTitle !== undefined && typeof data.jobTitle !== 'string')
        || (data.jobDescription !== undefined && typeof data.jobDescription !== 'string')) {
        throw new Error('This resume has incomplete or invalid analysis data. Please upload it again.');
    }
    return data as unknown as Resume;
}
