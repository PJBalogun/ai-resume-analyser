interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const getBadgeStyle = (score: number) => {
    if (score > 70) {
      return {
        backgroundColor: 'var(--color-success-light)',
        color: 'var(--color-success)',
        text: 'Strong'
      };
    } else if (score > 49) {
      return {
        backgroundColor: 'var(--color-warning-light)',
        color: 'var(--color-warning)', 
        text: 'Good Start'
      };
    } else {
      return {
        backgroundColor: 'var(--color-danger-light)',
        color: 'var(--color-danger)',
        text: 'Needs Work'
      };
    }
  };

  const badgeStyle = getBadgeStyle(score);

  return (
    <div 
      className="px-3 py-1 rounded-full border-2"
      style={{ 
        backgroundColor: badgeStyle.backgroundColor,
        borderColor: badgeStyle.color
      }}
    >
      <p 
        className="text-sm font-medium"
        style={{ color: badgeStyle.color }}
      >
        {badgeStyle.text}
      </p>
    </div>
  );
};

export default ScoreBadge;
