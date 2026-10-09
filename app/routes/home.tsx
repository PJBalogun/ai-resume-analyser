import type { MetaFunction } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link} from "react-router";
import {useEffect, useState} from "react";
import { useAuthGuard } from '~/lib/useAuthGuard';
import { parseResume } from '~/lib/feedback';

export const meta: MetaFunction = () => [
    { title: "ResumeAI Pro" },
    { name: "description", content: "AI-powered resume analysis and optimization" },
];

export default function Home() {
  const { auth, kv, error: sdkError } = usePuterStore();
  const ready = useAuthGuard('/');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!ready) { setResumes([]); setLoadingResumes(true); return; }
    const loadResumes = async () => {
      setLoadingResumes(true);
      setError('');
      try {
        const entries = await kv.list('resume:*', true);
        if (!entries) throw new Error('Unable to load resumes. Please reload to try again.');
        let invalid = 0;
        const parsed: Resume[] = [];
        for (const entry of entries) {
          try {
            if (typeof entry === 'string') throw new Error('Missing resume value');
            parsed.push(parseResume(entry.value));
          } catch { invalid++; }
        }
        if (active) {
          setResumes(parsed);
          if (invalid) setError(`${invalid} incomplete or invalid resume record(s) were skipped. Please upload those resumes again.`);
        }
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : 'Unable to load resumes.');
      } finally {
        if (active) setLoadingResumes(false);
      }
    }

    loadResumes()
    return () => { active = false; };
  }, [ready, kv, auth.user?.uuid]);

  return <main className="">
    <Navbar />

    <section className="main-section">
      {error && <p role="alert">{error}</p>}
      {sdkError && <p role="alert">{sdkError}</p>}
      <div className="page-heading dashboard-heading">
        <span className="eyebrow">YOUR CAREER WORKSPACE</span>
        <h1>A little progress.<br />A lot of possibility.</h1>
        {!loadingResumes && resumes?.length === 0 ? (
            <h2>Your next opportunity starts with a stronger resume.</h2>
        ): (
          <h2>Your resumes, insights, and next steps. All in one place.</h2>
        )}
      </div>
      {loadingResumes && !sdkError && (
          <div className="processing-indicator" role="status">
            <span className="loading-spinner" /> Loading your workspace…
          </div>
      )}

      {!loadingResumes && resumes.length > 0 && (
        <div className="workspace-heading"><h2>Your resumes <span className="count-badge">{resumes.length}</span></h2><span>Keep improving. Keep moving forward.</span></div>
      )}
      {!loadingResumes && resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {!loadingResumes && resumes?.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">▤</div>
            <span className="eyebrow">A FRESH START</span>
            <h2>Make your experience stand out.</h2>
            <p>Upload a resume to get your ATS score and a clear plan for what to improve.</p>
            <Link to="/upload" className="primary-button">Upload your first resume <span aria-hidden="true">↗</span></Link>
            <span className="signin-note">PDF files up to 20 MB</span>
          </div>
      )}
    </section>
  </main>
}
