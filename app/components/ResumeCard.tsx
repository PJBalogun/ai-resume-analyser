import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadResume = async () => {
            try {
                setIsLoading(true);
                const blob = await fs.read(imagePath);
                if(!blob) return;
                let url = URL.createObjectURL(blob);
                setResumeUrl(url);
            } catch (error) {
                console.error('Error loading resume image:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadResume();
    }, [imagePath]);

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="font-bold break-words" style={{ color: 'var(--color-text-primary)' }}>{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words" style={{ color: 'var(--color-text-secondary)' }}>{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {isLoading ? (
                <div className="gradient-border animate-pulse">
                    <div 
                        className="w-full h-[350px] max-sm:h-[200px] rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-bg-accent)' }}
                    >
                        <span style={{ color: 'var(--color-text-secondary)' }}>Loading...</span>
                    </div>
                </div>
            ) : resumeUrl ? (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full h-full">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-contain object-top rounded-lg"
                            loading="lazy"
                        />
                    </div>
                </div>
            ) : (
                <div className="gradient-border">
                    <div 
                        className="w-full h-[350px] max-sm:h-[200px] rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-bg-accent)' }}
                    >
                        <span style={{ color: 'var(--color-text-secondary)' }}>No image available</span>
                    </div>
                </div>
            )}
        </Link>
    )
}
export default ResumeCard
