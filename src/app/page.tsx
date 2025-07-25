"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { mockWasteReports } from "@/lib/data";
import { AlertTriangle, MapPin, Trash2, BellRing, BrainCircuit, LoaderCircle as Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardMap from "@/components/dashboard-map";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendSms } from "@/ai/flows/send-sms-flow";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { calculateFloodRisk } from "@/ai/flows/calculate-flood-risk-flow";
import { Chatbot } from "@/components/chatbot";


interface FloodRisk {
    riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
    reasoning: string;
}

export default function Home() {
  const { toast } = useToast();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [floodRisk, setFloodRisk] = useState<FloodRisk | null>(null);
  const [isLoadingRisk, setIsLoadingRisk] = useState(true);

  useEffect(() => {
    const getFloodRisk = async () => {
        setIsLoadingRisk(true);
        try {
            // In a real app, weather would come from an API
            const weatherForecast = "Increased rainfall expected in Victoria Island.";
            const areaName = "Monrovia";
            const result = await calculateFloodRisk({ reports: mockWasteReports, areaName, weatherForecast });
            setFloodRisk(result);
        } catch (error) {
            console.error("Error fetching flood risk:", error);
            // Set a default/fallback risk on error
            setFloodRisk({
                riskLevel: 'Medium',
                reasoning: 'Could not load live risk assessment. Please be cautious.'
            });
        } finally {
            setIsLoadingRisk(false);
        }
    };
    getFloodRisk();
  }, []);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    // In a real app, you'd get the user's phone number from their profile.
    const userPhoneNumber = "+15551234567"; // Placeholder phone number
    
    const smsContent = `Gbala Alert: ${floodRisk?.riskLevel || 'High'} flood risk detected in your area. Reason: ${floodRisk?.reasoning || 'Please take necessary precautions.'}`;

    try {
      const result = await sendSms({ to: userPhoneNumber, body: smsContent });
      if (result.success) {
        toast({
          title: "Subscribed to Alerts!",
          description: "You will now receive flood risk notifications via SMS.",
        });
      } else {
        throw new Error(result.error || "Failed to send SMS.");
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: "Could not subscribe to SMS alerts. Please try again later.",
      });
    } finally {
        setIsSubscribing(false);
    }
  };

  const getRiskColor = () => {
    switch (floodRisk?.riskLevel) {
        case 'High':
        case 'Severe':
            return 'text-destructive';
        case 'Medium':
            return 'text-accent';
        case 'Low':
            return 'text-green-500';
        default:
            return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-12 lg:col-span-4">
           <DashboardMap />
        </div>
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card className="bg-secondary/50 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                AI Flood Risk Assessment
              </CardTitle>
              <BrainCircuit className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoadingRisk ? (
                <div className="flex flex-col items-center justify-center h-full pt-4">
                    <Loader className="h-6 w-6 animate-spin text-primary"/>
                    <p className="text-xs text-muted-foreground mt-2">Analyzing data...</p>
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${getRiskColor()}`}>{floodRisk?.riskLevel || 'Unknown'} Risk</div>
                  <p className="text-xs text-muted-foreground">
                    {floodRisk?.reasoning || 'Risk assessment could not be loaded.'}
                  </p>
                </>
              )}
            </CardContent>
             <CardFooter>
              <Button variant="ghost" className="w-full bg-accent/20 hover:bg-accent/40 text-accent-foreground" onClick={handleSubscribe} disabled={isSubscribing || isLoadingRisk}>
                 {isSubscribing ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <BellRing className="mr-2 h-4 w-4"/>
                    Subscribe for SMS Alerts
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Latest waste reports from the community.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockWasteReports.slice(0, 3).map(report => (
                <div key={report.id} className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Trash2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{report.description}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                       <MapPin className="h-3 w-3 mr-1" /> {report.locationName}
                       <Badge variant="secondary" className="ml-2">{report.type}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
