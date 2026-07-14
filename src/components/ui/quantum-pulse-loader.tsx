import { cn } from "@/lib/utils";

export function QuantumPulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn("generating-loader-wrapper", className)}>
      <div className="generating-loader-text">
        {"Generating".split("").map((letter, i) => (
          <span key={i} className="generating-loader-letter" style={{ animationDelay: `${i * 0.08}s` }}>
            {letter}
          </span>
        ))}
      </div>
      <div className="generating-loader-bar" />
    </div>
  );
}
