import React from 'react'

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  // Determine colors based on score
  const scoreColors = score > 69
    ? { bg: 'var(--color-success-light)', text: 'var(--color-success)', border: 'var(--color-success-border)' }
    : score > 49
      ? { bg: 'var(--color-warning-light)', text: 'var(--color-warning)', border: 'var(--color-warning-border)' }
      : { bg: 'var(--color-danger-light)', text: 'var(--color-danger)', border: 'var(--color-danger-border)' };

  // Determine icon based on score
  const iconSrc = score > 69
    ? '/icons/ats-good.svg'
    : score > 49
      ? '/icons/ats-warning.svg'
      : '/icons/ats-bad.svg';

  // Determine subtitle based on score
  const subtitle = score > 69
    ? 'Great Job!'
    : score > 49
      ? 'Good Start'
      : 'Needs Improvement';

  return (
    <div 
      className="rounded-2xl w-full p-6 border-2 transition-all duration-300 hover:transform hover:-translate-y-1"
      style={{ 
        background: 'var(--color-bg-secondary)',
        borderColor: scoreColors.border,
        boxShadow: '0 8px 25px var(--color-shadow-light)'
      }}
    >
      {/* Top section with icon and headline */}
      <div className="flex items-center gap-4 mb-6">
        <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
        <div>
          <h2 
            className="text-2xl font-bold" 
            style={{ color: 'var(--color-text-primary)' }}
          >
            ATS Score - {score}/100
          </h2>
        </div>
      </div>

      {/* Description section */}
      <div className="mb-6">
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ color: scoreColors.text }}
        >
          {subtitle}
        </h3>
        <p 
          className="mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
        </p>

        {/* Suggestions list */}
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              <img
                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt={suggestion.type === "good" ? "Check" : "Warning"}
                className="w-5 h-5 mt-1"
              />
              <p 
                style={{ 
                  color: suggestion.type === "good" 
                    ? 'var(--color-success)' 
                    : 'var(--color-warning)' 
                }}
              >
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing encouragement */}
      <p 
        className="italic"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
      </p>
    </div>
  )
}

export default ATS
