"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { wasteTypes } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Send, MapPin, Upload, Camera, CameraIcon, LoaderCircle, Sparkles } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { analyzeWastePhoto } from '@/ai/flows/analyze-waste-photo-flow';

const formSchema = z.object({
  wasteType: z.string().min(1, { message: 'Please select a waste type.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  location: z.string().min(3, { message: 'Please enter a valid location.' }),
  photo: z.any().refine(file => file, 'A photo is required.'),
});

export default function WasteReportForm() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiWasteType, setAiWasteType] = useState<string | null>(null);

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        wasteType: '',
        description: '',
        location: '',
        photo: undefined,
      },
    });

    useEffect(() => {
      if (lat && lng) {
        form.setValue('location', `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}`);
      }
    }, [lat, lng, form]);

    useEffect(() => {
      if (isCameraOpen) {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings.',
            });
          }
        };
        getCameraPermission();
      } else {
        // Stop camera stream when dialog is closed
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
      }
    }, [isCameraOpen, toast]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('photo', file);
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
              const result = loadEvent.target?.result as string;
              setImagePreview(result);
              setCapturedImage(null);
              handleAiAnalysis(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
            }
        }
    };
    
    const confirmCapturedImage = () => {
        if (capturedImage) {
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
                    form.setValue('photo', file);
                    setImagePreview(capturedImage);
                    setIsCameraOpen(false);
                    setCapturedImage(null);
                    handleAiAnalysis(capturedImage);
                });
        }
    };

    const handleAiAnalysis = async (photoDataUri: string) => {
      setIsAnalyzing(true);
      setAiWasteType(null);
      try {
        const result = await analyzeWastePhoto({ photoDataUri });
        
        const suggestedType = wasteTypes.find(t => t.toLowerCase() === result.wasteType.toLowerCase());

        if (suggestedType) {
            form.setValue('wasteType', suggestedType, { shouldValidate: true });
            setAiWasteType(suggestedType); // Store the AI-detected type
            toast({
                title: 'AI Analysis Complete',
                description: `Suggested waste type: ${suggestedType}. (${result.reasoning})`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'AI Analysis',
                description: `AI suggested an unsupported type: ${result.wasteType}. Please select one manually.`,
            });
        }

      } catch (error) {
        console.error("AI analysis failed:", error);
        toast({
            variant: "destructive",
            title: "AI Analysis Failed",
            description: "Could not analyze the photo. Please select the waste type manually."
        });
      } finally {
        setIsAnalyzing(false);
      }
    };


    async function onSubmit(values: z.infer<typeof formSchema>) {
      setIsSubmitting(true);
      console.log("Simulating submission with values:", values);

      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Report Submitted!',
        description: 'Thank you for helping keep our city clean. We will now show you nearby disposal sites.',
      });
      
      // Redirect to dump sites page with the AI-detected filter if available
      if (aiWasteType) {
        router.push(`/dump-sites?filter=${aiWasteType}`);
      } else {
        router.push('/dump-sites');
      }

      form.reset();
      setImagePreview(null);
      setCapturedImage(null);
      setIsSubmitting(false);
      setAiWasteType(null);
    }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>New Waste Report</CardTitle>
        <CardDescription>Your contribution makes a difference.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormItem>
                <FormLabel>Photo</FormLabel>
                <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileChange}
                        disabled={isSubmitting || isAnalyzing}
                      />
                    </FormControl>
                     <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('file-upload')?.click()} disabled={isSubmitting || isAnalyzing}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                    <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" className="w-full" disabled={isSubmitting || isAnalyzing}>
                                <Camera className="mr-2 h-4 w-4" />
                                Take Photo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Take a Photo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                               {capturedImage ? (
                                    <div className="space-y-4">
                                        <Image src={capturedImage} alt="Captured" width={400} height={300} className="rounded-md" />
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setCapturedImage(null)}>Retake</Button>
                                            <Button onClick={confirmCapturedImage}>Confirm</Button>
                                        </DialogFooter>
                                    </div>
                               ) : (
                                <>
                                  <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
                                  <canvas ref={canvasRef} className="hidden" />

                                  {hasCameraPermission === false && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Camera Access Required</AlertTitle>
                                        <AlertDescription>
                                            Please allow camera access to use this feature.
                                        </AlertDescription>
                                    </Alert>
                                  )}

                                  <DialogFooter>
                                    <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                                        <CameraIcon className="mr-2 h-4 w-4"/>
                                        Capture
                                    </Button>
                                  </DialogFooter>
                                </>
                               )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                 {imagePreview && (
                    <div className="mt-4">
                        <Label>Photo Preview</Label>
                        <div className="mt-2 rounded-md border border-dashed aspect-video overflow-hidden relative">
                            <Image src={imagePreview} alt="Selected preview" layout="fill" objectFit="cover" />
                             {isAnalyzing && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                    <Sparkles className="h-8 w-8 animate-pulse" />
                                    <p className="mt-2 text-sm font-semibold">AI is analyzing...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <FormField
                    control={form.control}
                    name="photo"
                    render={() => (
                       <FormMessage />
                    )}
                />
            </FormItem>
            
            <FormField
              control={form.control}
              name="wasteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Waste</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || isAnalyzing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a waste type (or upload a photo for AI suggestion)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wasteTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the waste and the situation..." {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                   <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g., Corner of Broad St. & Martins St." {...field} className="pl-10" disabled={isSubmitting} />
                    </div>
                  </FormControl>
                   {lat && lng ? (
                    <FormDescription>
                      Location automatically filled from map.
                    </FormDescription>
                  ) : (
                     <FormDescription>
                      You can also click &apos;Report Waste&apos; on the map to autofill this.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
           
            <Button type="submit" className="w-full" disabled={isSubmitting || isAnalyzing}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : isAnalyzing ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Waiting for AI...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4"/>
                  Submit Report
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
