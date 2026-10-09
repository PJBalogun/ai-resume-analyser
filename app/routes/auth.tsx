import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";
import type { MetaFunction } from "react-router";
import Brand from '~/components/Brand';
import ThemeToggle from '~/components/ThemeToggle';

export const meta: MetaFunction = () => [
    { title: 'ResumeAI Pro | Auth' },
    { name: "description", content: "Sign in to ResumeAI Pro" },
];

const Auth = () => {
    const { isLoading, auth, error } = usePuterStore();
    const location = useLocation();
    const requestedNext = new URLSearchParams(location.search).get('next');
    const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
        && !requestedNext.includes('\\') && !requestedNext.startsWith('/auth') ? requestedNext : '/';
    const navigate = useNavigate();

    useEffect(() => {
        if(auth.isAuthenticated) navigate(next, { replace: true });
    }, [auth.isAuthenticated, next, navigate])

    return (
        <main className="auth-page">
            <header className="auth-header"><Brand /><ThemeToggle /></header>
            <div className="auth-layout">
                <section className="auth-copy">
                    <span className="eyebrow"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</span>
                    <h1>A stronger resume.<br />A better <span className="headline-accent">first impression.</span></h1>
                    <p className="auth-description">Turn your experience into a resume that stands out. Get thoughtful AI feedback, understand your ATS score, and apply with more confidence.</p>
                    <div className="auth-signin">
                        <h2>Welcome to your next opportunity.</h2>
                        <p>Sign in to upload your resume and see where you can improve.</p>
                        {error && <p role="alert">{error}</p>}
                        <button className="auth-button" disabled={isLoading} onClick={auth.isAuthenticated ? auth.signOut : auth.signIn}>
                            {isLoading ? 'Connecting…' : auth.isAuthenticated ? 'Sign out' : 'Continue with Puter'}
                            {!isLoading && <span aria-hidden="true">↗</span>}
                        </button>
                        <span className="signin-note">Your resume and feedback, together in one place.</span>
                    </div>
                    <div className="auth-features"><span>✓ ATS insights</span><span>✓ Practical feedback</span><span>✓ Resume tracking</span></div>
                </section>
                <aside className="auth-showcase" aria-label="Example resume feedback">
                    <div className="showcase-top"><span>SMALL CHANGES. BIG POSSIBILITIES.</span><span aria-hidden="true">✳</span></div>
                    <h2>See your resume<br />in a new light.</h2>
                    <p>Know what works. Find what’s missing.<br />Make your next application count.</p>
                    <div className="sample-report">
                        <div className="sample-report-heading"><span className="sample-document" aria-hidden="true">▤</span><div><strong>Your resume, reviewed</strong><span>Example analysis</span></div><span className="sample-complete">✓ Complete</span></div>
                        <div className="sample-score"><div className="sample-score-ring"><strong>84</strong><span>out of 100</span></div><div><span className="sample-pill">A strong foundation</span><h3>You’re on the right track.</h3><p>A few thoughtful edits can help<br />your experience shine.</p></div></div>
                        <div className="sample-metric"><span>Content & impact</span><span className="sample-bar"><i style={{width:'88%'}} /></span><strong>88</strong></div>
                        <div className="sample-metric"><span>Structure & clarity</span><span className="sample-bar"><i style={{width:'92%'}} /></span><strong>92</strong></div>
                        <div className="sample-metric"><span>Skills & relevance</span><span className="sample-bar"><i style={{width:'76%'}} /></span><strong>76</strong></div>
                        <div className="sample-tip"><span aria-hidden="true">✦</span><div><strong>Make your impact measurable</strong><p>Add results and numbers to show what you achieved.</p></div></div>
                    </div>
                    <div className="showcase-footer"><span>A little clarity goes a long way.</span><span aria-hidden="true">↗</span></div>
                </aside>
            </div>
            <footer className="auth-footer"><span>Built for your next step.</span><span>ResumeAI Pro</span></footer>
        </main>
    )
}

export default Auth
