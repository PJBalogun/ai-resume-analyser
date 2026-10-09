import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import { parseFeedback } from '~/lib/feedback';
import { useAuthGuard } from '~/lib/useAuthGuard';
import { serviceErrorMessage } from '~/lib/serviceErrors';

const Upload = () => {
    const { fs, ai, kv, error: sdkError } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const ready = useAuthGuard('/upload');

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setError('');
        let stage = 'Upload';
        try {
            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile?.path) throw new Error('The upload did not return a resume file path. Please try again.');

            setStatusText('Converting to image...');
            stage = 'PDF preview';
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) throw new Error(imageFile.error || 'Failed to convert PDF to image');

            setStatusText('Uploading the image...');
            stage = 'Preview upload';
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage?.path) throw new Error('The upload did not return a preview file path. Please try again.');

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            setStatusText('Analyzing...');
            stage = 'AI analysis';

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            )
            if (!feedback) throw new Error('Failed to analyze resume. Please try again.');
            if (feedback.finish_reason === 'length') throw new Error('The AI response was cut short. Try a shorter job description.');
            stage = 'Reading AI feedback';
            const analyzedFeedback = parseFeedback(feedback.message?.content, Boolean(jobDescription.trim()));
            if (!jobDescription.trim()) analyzedFeedback.jobMatch = null;
            const data = {
                id: uuid, resumePath: uploadedFile.path, imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: analyzedFeedback,
            };
            stage = 'Saving analysis';
            if (!await kv.set(`resume:${uuid}`, JSON.stringify(data))) {
                throw new Error('Failed to save analysis. Please try again.');
            }
            setStatusText('Analysis complete, redirecting...');
            navigate(`/resume/${uuid}`);
        } catch (error) {
            setError(`${stage}: ${serviceErrorMessage(error, 'The service did not provide an error description. Please try again.')}`);
        } finally {
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!ready || isProcessing) return;
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) { setError('Please select a PDF resume.'); return; }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="">
            <Navbar />

            <section className="main-section">
                <div className="page-heading upload-heading">
                    <span className="eyebrow">LET’S FIND YOUR NEXT STEP</span>
                    <h1>Good experience.<br /><span className="headline-accent">Even better on paper.</span></h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <div className="processing-indicator" role="status"><span className="loading-spinner" /> Working through your resume…</div>
                        </>
                    ) : (
                        <h2>Add your resume and the role you have in mind. We’ll help connect the dots.</h2>
                    )}
                    {error && <p role="alert">{error}</p>}
                    {sdkError && <p role="alert">{sdkError}</p>}
                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                        <div className="form-heading"><span className="step-number">01</span><div><h3>A little context</h3><p>Job details are optional, but make your feedback more relevant.</p></div></div>
                        <fieldset disabled={isProcessing || !ready} className="flex flex-col gap-4">
                        <div className="form-div">
                            <label htmlFor="company-name">Company <span className="optional-label">Optional</span></label>
                            <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-title">Job title <span className="optional-label">Optional</span></label>
                            <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Job description <span className="optional-label">Optional</span></label>
                            <textarea rows={5} name="job-description" placeholder="Paste the job description to see matched requirements, missing keywords, and tailored next steps…" id="job-description" aria-describedby="job-match-hint" />
                            <p id="job-match-hint" className="form-hint">Include a job description to unlock your job-match breakdown.</p>
                        </div>

                        <div className="form-div">
                            <div className="form-heading"><span className="step-number">02</span><div><h3>Your resume</h3><p>One PDF. A clearer picture of your next steps.</p></div></div>
                            <label htmlFor="uploader">Upload Resume</label>
                            <FileUploader file={file} disabled={isProcessing || !ready} onFileSelect={handleFileSelect} />
                        </div>

                        <button className="primary-button" type="submit">
                            Analyze my resume <span aria-hidden="true">↗</span>
                        </button>
                        </fieldset>
                    </form>
                </div>
            </section>
        </main>
    )
}
export default Upload
