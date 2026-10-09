import {Link, useParams} from "react-router";
import type { MetaFunction } from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import JobMatchBreakdown from '~/components/JobMatchBreakdown';
import { useAuthGuard } from '~/lib/useAuthGuard';
import { parseResume } from '~/lib/feedback';

export const meta: MetaFunction = () => [
    { title: 'ResumeAI Pro | Review' },
    { name: "description", content: "Review and analyze your resume with AI" },
];

const Resume = () => {
    const { auth, fs, kv, error: sdkError } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [isLoadingResume, setIsLoadingResume] = useState(true);
    const ready = useAuthGuard(`/resume/${id}`);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const urls: string[] = [];
        setImageUrl('');
        setResumeUrl('');
        setFeedback(null);
        setResumeData(null);
        setError('');
        setIsLoadingResume(true);
        if (!ready) return;
        const loadResume = async () => {
            try {
                setIsLoadingResume(true);
                const resume = await kv.get(`resume:${id}`);

                if(!resume) throw new Error('Resume not found.');

                const data = parseResume(resume);

                const resumeBlob = await fs.read(data.resumePath);
                if(!resumeBlob) throw new Error('Unable to read the resume PDF.');
                if (!active) return;

                const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                const resumeUrl = URL.createObjectURL(pdfBlob);
                urls.push(resumeUrl);
                setResumeUrl(resumeUrl);

                const imageBlob = await fs.read(data.imagePath);
                if(!imageBlob) throw new Error('Unable to read the resume preview.');
                if (!active) return;
                const imageUrl = URL.createObjectURL(imageBlob);
                urls.push(imageUrl);
                setImageUrl(imageUrl);

                setFeedback(data.feedback);
                setResumeData(data);
            } catch (error) {
                if (active) setError(error instanceof Error ? error.message : 'Unable to load resume.');
            } finally {
                if (active) setIsLoadingResume(false);
            }
        }

        loadResume();
        return () => {
            active = false;
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [id, ready, fs, kv, auth.user?.uuid]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full resume-page-container max-lg:flex-col">
                <section className="feedback-section resume-image-section h-[100vh] sticky top-0 items-center justify-center max-lg:h-auto max-lg:relative max-lg:sticky-none">
                    {isLoadingResume ? (
                        <div className="gradient-border animate-pulse max-sm:m-0 h-[90%] max-lg:h-fit w-fit max-lg:w-full">
                            <div 
                                className="w-full h-full rounded-2xl flex items-center justify-center min-h-[600px] max-lg:min-h-[400px] max-sm:min-h-[350px] aspect-[8.5/11] max-lg:aspect-[8.5/11]"
                                style={{ backgroundColor: 'var(--color-bg-accent)' }}
                            >
                                <span style={{ color: 'var(--color-text-secondary)' }}>Loading resume...</span>
                            </div>
                        </div>
                    ) : imageUrl && resumeUrl ? (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-lg:h-fit w-fit max-lg:w-full">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl max-lg:max-h-[400px] max-sm:max-h-[350px] aspect-[8.5/11]"
                                    title="resume"
                                    loading="lazy"
                                />
                            </a>
                        </div>
                    ) : (
                        <div className="gradient-border max-sm:m-0 h-[90%] max-lg:h-fit w-fit max-lg:w-full">
                            <div 
                                className="w-full h-full rounded-2xl flex items-center justify-center min-h-[600px] max-lg:min-h-[400px] max-sm:min-h-[350px] aspect-[8.5/11] max-lg:aspect-[8.5/11]"
                                style={{ backgroundColor: 'var(--color-bg-accent)' }}
                            >
                                <span style={{ color: 'var(--color-text-secondary)' }}>Resume not found</span>
                            </div>
                        </div>
                    )}
                </section>
                <section className="feedback-section resume-content-section !pt-4 max-lg:!pt-8">
                    <h2 className="text-4xl font-bold max-sm:text-3xl mobile-text-wrap" style={{ color: 'var(--color-text-primary)' }}>Resume Review</h2>
                    {error || sdkError ? <p role="alert">{error || sdkError}</p> : feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000 max-sm:gap-6">
                            <Summary feedback={feedback} />
                            <JobMatchBreakdown match={feedback.jobMatch} jobTitle={resumeData?.jobTitle} hasDescription={Boolean(resumeData?.jobDescription?.trim())} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : isLoadingResume ? (
                        <div className="processing-indicator" role="status"><span className="loading-spinner" /> Loading your feedback…</div>
                    ) : <p>No analysis available. Please upload your resume again.</p>}
                </section>
            </div>
        </main>
    )
}
export default Resume
