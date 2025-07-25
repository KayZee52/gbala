import AIAnalysisClient from './ai-analysis-client';

export default function AIAnalysisPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">AI Plastic Detection</h2>
        <p className="text-muted-foreground">
          Upload a satellite image to detect potential plastic accumulation zones.
        </p>
      </div>
      <AIAnalysisClient />
    </div>
  );
}
