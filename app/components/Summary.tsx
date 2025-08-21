import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {
    const getScoreColor = (score: number) => {
        if (score > 70) return 'var(--color-success)';
        if (score > 49) return 'var(--color-warning)'; 
        return 'var(--color-danger)';
    };

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-2xl font-bold">
                    <span style={{ color: getScoreColor(score) }}>{score}</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>/100</span>
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="gradient-border w-full">
            <div className="flex flex-row items-center p-4 gap-8 max-sm:flex-col max-sm:gap-4 max-sm:p-3">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2 max-sm:text-center">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Your Resume Score</h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
                <Category title="Content" score={feedback.content.score} />
                <Category title="Structure" score={feedback.structure.score} />
                <Category title="Skills" score={feedback.skills.score} />
            </div>
        </div>
    )
}
export default Summary
