"use client";

import { useState } from 'react';
import Image from 'next/image';
import { analyzePlasticAccumulation } from '@/ai/flows/analyze-plastic-accumulation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { List, ListChecks, LoaderCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AIAnalysisClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string[] | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setPreviewUrl(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalysis = async () => {
    if (!file || !previewUrl) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzePlasticAccumulation({ satelliteImageDataUri: previewUrl });
      if (response && response.plasticAccumulationZones) {
        setResult(response.plasticAccumulationZones);
        if (response.plasticAccumulationZones.length === 0) {
            toast({
                title: "Analysis Complete",
                description: "No significant plastic accumulation zones were detected.",
            });
        }
      } else {
        throw new Error("Invalid response from the analysis service.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
       toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSampleImage = () => {
    const sampleImageUrl = 'https://placehold.co/800x600.png';
    // We can't directly create a File object from a remote URL due to security restrictions.
    // So we'll fetch it, convert to blob, and then to a File object.
    fetch(sampleImageUrl)
      .then(res => res.blob())
      .then(blob => {
        const sampleFile = new File([blob], "sample-image.png", { type: "image/png" });
        setFile(sampleFile);
        setResult(null);
        setError(null);
        setPreviewUrl(sampleImageUrl);
        toast({
            title: "Sample Image Loaded",
            description: "You can now run the analysis.",
        });
      });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Satellite Image</CardTitle>
          <CardDescription>Select a satellite image file (.jpg, .png) to analyze.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="satellite-image">Image File</Label>
            <div className="flex gap-2">
                <Input id="satellite-image" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                <Button variant="ghost" size="icon" onClick={() => document.getElementById('satellite-image')?.click()}>
                    <Upload className="h-4 w-4" />
                </Button>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            or
          </div>
          <Button variant="secondary" className="w-full" onClick={handleUseSampleImage} data-ai-hint="satellite view">
            Use Sample Image
          </Button>

          {previewUrl && (
            <div className="mt-4">
              <Label>Image Preview</Label>
              <div className="mt-2 rounded-md border border-dashed aspect-video overflow-hidden relative">
                <Image src={previewUrl} alt="Selected satellite view" layout="fill" objectFit="cover" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalysis} disabled={isLoading || !file} className="w-full">
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze for Plastic"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Potential plastic accumulation zones will be listed here.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">AI is analyzing the image...</p>
            </div>
          )}
          {error && (
             <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <div className="space-y-2">
              {result.length > 0 ? (
                <ul className="space-y-2">
                  {result.map((zone, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 rounded-md bg-secondary">
                        <ListChecks className="h-4 w-4 text-primary" />
                        <span>{zone}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-center">
                    <List className="h-8 w-8 text-muted-foreground"/>
                    <p className="text-muted-foreground">No significant accumulation zones found.</p>
                </div>
              )}
            </div>
          )}
          {!isLoading && !error && !result && (
             <div className="flex flex-col items-center justify-center h-48 space-y-2 text-center">
                <List className="h-8 w-8 text-muted-foreground"/>
                <p className="text-muted-foreground">Upload an image and run analysis to see results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
