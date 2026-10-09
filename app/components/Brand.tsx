import { Link } from 'react-router';

export default function Brand() {
  return <Link to="/" className="brand" aria-label="ResumeAI Pro home">
    <span className="brand-mark" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3v5h4M10 12h5M10 16h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
    </span>
    <span>resume<span className="brand-accent">ai</span><small>PRO</small></span>
  </Link>;
}
