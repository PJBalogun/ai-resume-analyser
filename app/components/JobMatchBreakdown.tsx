import { useState } from 'react';
import { Link } from 'react-router';

const statusLabels = { matched: 'Matched', partial: 'Partial match', missing: 'Not demonstrated' };
const priorityOrder = { high: 0, medium: 1, low: 2 };

export default function JobMatchBreakdown({ match, jobTitle, hasDescription }: {
    match?: JobMatch | null;
    jobTitle?: string;
    hasDescription: boolean;
}) {
    const [filter, setFilter] = useState<'all' | 'matched' | 'gaps'>('all');

    if (!match) return <section className="job-match-empty" aria-labelledby="job-match-heading">
        <span className="eyebrow">YOUR FIT FOR THE ROLE</span>
        <h3 id="job-match-heading">Job-match breakdown</h3>
        <p>{hasDescription
            ? 'This saved analysis does not include job matching. Analyze your resume again to see your fit for the role.'
            : 'Add a job description when you analyze your resume to see matched requirements, gaps, and tailored next steps.'}</p>
        <Link to="/upload" className="secondary-button">Analyze with a job description <span aria-hidden="true">↗</span></Link>
    </section>;

    const matched = match.requirements.filter((item) => item.status === 'matched').length;
    const partial = match.requirements.filter((item) => item.status === 'partial').length;
    const missing = match.requirements.filter((item) => item.status === 'missing').length;
    const requirements = [...match.requirements]
        .filter((item) => filter === 'all' || (filter === 'matched' ? item.status === 'matched' : item.status !== 'matched'))
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return <section className="job-match-panel" aria-labelledby="job-match-heading">
        <header className="job-match-header">
            <div><span className="eyebrow">YOUR FIT FOR THE ROLE</span><h3 id="job-match-heading">Job-match breakdown</h3>{jobTitle && <p>{jobTitle}</p>}</div>
            <div className="match-score"><strong>{match.score}<small>/100</small></strong><span>Estimated alignment</span></div>
        </header>
        <p className="match-summary">{match.summary}</p>
        <div className="match-counts"><span><i className="match-dot matched" />{matched} matched</span><span><i className="match-dot partial" />{partial} partial</span><span><i className="match-dot missing" />{missing} not demonstrated</span></div>
        <div className="match-filters" role="group" aria-label="Filter job requirements">
            {([{ id: 'all', label: 'All requirements', count: match.requirements.length }, { id: 'matched', label: 'Matched', count: matched }, { id: 'gaps', label: 'Needs attention', count: partial + missing }] as const).map((tab) =>
                <button type="button" key={tab.id} aria-pressed={filter === tab.id} onClick={() => setFilter(tab.id)}>{tab.label} <span>{tab.count}</span></button>)}
        </div>
        <div className="match-requirements">
            {requirements.map((item, index) => <article className="match-requirement" key={`${item.requirement}-${index}`}>
                <div className="match-requirement-top"><span className={`match-status ${item.status}`}>{statusLabels[item.status]}</span><span className="match-priority">{item.priority === 'high' ? 'High priority' : item.priority === 'medium' ? 'Medium priority' : 'Low priority'}</span></div>
                <h4>{item.requirement}</h4>
                <p className="match-evidence"><strong>Resume evidence</strong>{item.evidence}</p>
                <p className="match-next-step"><strong>Next step</strong>{item.nextStep}</p>
            </article>)}
            {requirements.length === 0 && <p className="match-filter-empty">{filter === 'matched' ? 'No requirements are fully demonstrated yet. Review Needs attention for your next steps.' : 'All evaluated requirements are demonstrated in your resume.'}</p>}
        </div>
        <div className="match-keywords">
            <div><h4>Keywords covered</h4><div className="keyword-list">{match.matchedKeywords.map((word, index) => <span className="keyword covered" key={`${word}-${index}`}>{word}</span>)}{!match.matchedKeywords.length && <p>No matching keywords identified.</p>}</div></div>
            <div><h4>Keywords to review</h4><div className="keyword-list">{match.missingKeywords.map((word, index) => <span className="keyword missing" key={`${word}-${index}`}>{word}</span>)}{!match.missingKeywords.length && <p>No missing keywords identified.</p>}</div></div>
        </div>
        <p className="match-note">Based on the supplied job description and resume. This AI estimate is separate from your ATS score. “Not demonstrated” means the resume lacks evidence. Add skills or experience only when accurate.</p>
    </section>;
}
