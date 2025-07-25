import WasteReportForm from './waste-report-form';

export default function ReportWastePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Report Illegal Dumping</h2>
        <p className="text-muted-foreground">
          Fill out the form below to report an area with illegally dumped waste.
        </p>
      </div>
      <WasteReportForm />
    </div>
  );
}
