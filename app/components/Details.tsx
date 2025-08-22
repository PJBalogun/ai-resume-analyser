import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

const ScoreBadge = ({ score }: { score: number }) => {
  const scoreColors = score > 69
    ? { bg: 'var(--color-success-light)', text: 'var(--color-success)', border: 'var(--color-success-border)' }
    : score > 39
      ? { bg: 'var(--color-warning-light)', text: 'var(--color-warning)', border: 'var(--color-warning-border)' }
      : { bg: 'var(--color-danger-light)', text: 'var(--color-danger)', border: 'var(--color-danger-border)' };

  return (
      <div
          className="flex flex-row gap-2 items-center px-3 py-1 rounded-full border-2 flex-shrink-0"
          style={{ 
            backgroundColor: scoreColors.bg,
            borderColor: scoreColors.border
          }}
      >
        <img
            src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
            alt="score"
            className="w-4 h-4 flex-shrink-0 sm:max-w-3.5 sm:max-h"
        />
        <p
            className="text-sm font-semibold whitespace-nowrap"
            style={{ color: scoreColors.text }}
        >
          {score}/100
        </p>
      </div>
  );
};

const CategoryHeader = ({
                          title,
                          categoryScore,
                        }: {
  title: string;
  categoryScore: number;
}) => {
  return (
      <div className="flex flex-row gap-3 items-center py-2 max-sm:flex-col max-sm:items-start max-sm:gap-2">
        <p 
          className="text-2xl font-semibold max-sm:text-xl"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </p>
        <ScoreBadge score={categoryScore} />
      </div>
  );
};

const CategoryContent = ({
                           tips,
                         }: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
      <div className="flex flex-col gap-4 items-center w-full">
        <div 
          className="w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4 border max-sm:grid-cols-1"
          style={{ 
            backgroundColor: 'var(--color-bg-accent)',
            borderColor: 'var(--color-border-light)'
          }}
        >
          {tips.map((tip, index) => (
              <div className="flex flex-row gap-3 items-center" key={index}>
                <img
                    src={
                      tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"
                    }
                    alt="score"
                    className="w-5 h-5 flex-shrink-0"
                />
                <p 
                  className="text-lg font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {tip.tip}
                </p>
              </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 w-full">
          {tips.map((tip, index) => {
            const tipColors = tip.type === "good"
              ? { bg: 'var(--color-success-light)', border: 'var(--color-success-border)', text: 'var(--color-success)' }
              : { bg: 'var(--color-warning-light)', border: 'var(--color-warning-border)', text: 'var(--color-warning)' };
            
            return (
              <div
                  key={index + tip.tip}
                  className="flex flex-col gap-2 rounded-2xl p-4 border-2"
                  style={{
                    backgroundColor: tipColors.bg,
                    borderColor: tipColors.border,
                    color: tipColors.text
                  }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <img
                      src={
                        tip.type === "good"
                            ? "/icons/check.svg"
                            : "/icons/warning.svg"
                      }
                      alt="score"
                      className="size-5"
                  />
                  <p className="text-xl font-semibold">{tip.tip}</p>
                </div>
                <p>{tip.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
  );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
      <div className="flex flex-col gap-4 w-full">
        <Accordion>
          <AccordionItem id="tone-style">
            <AccordionHeader itemId="tone-style">
              <CategoryHeader
                  title="Tone & Style"
                  categoryScore={feedback.toneAndStyle.score}
              />
            </AccordionHeader>
            <AccordionContent itemId="tone-style">
              <CategoryContent tips={feedback.toneAndStyle.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="content">
            <AccordionHeader itemId="content">
              <CategoryHeader
                  title="Content"
                  categoryScore={feedback.content.score}
              />
            </AccordionHeader>
            <AccordionContent itemId="content">
              <CategoryContent tips={feedback.content.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="structure">
            <AccordionHeader itemId="structure">
              <CategoryHeader
                  title="Structure"
                  categoryScore={feedback.structure.score}
              />
            </AccordionHeader>
            <AccordionContent itemId="structure">
              <CategoryContent tips={feedback.structure.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="skills">
            <AccordionHeader itemId="skills">
              <CategoryHeader
                  title="Skills"
                  categoryScore={feedback.skills.score}
              />
            </AccordionHeader>
            <AccordionContent itemId="skills">
              <CategoryContent tips={feedback.skills.tips} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
  );
};

export default Details;
