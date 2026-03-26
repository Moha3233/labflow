import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

export function Help() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
      <p className="text-muted-foreground">Learn how to use LabFlow for your daily biochemistry tasks.</p>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does the Dilution Calculator work?</AccordionTrigger>
              <AccordionContent>
                The dilution calculator uses the standard formula C1V1 = C2V2. To use it, enter three of the four values and leave the one you want to calculate completely empty. The app will automatically solve for the missing variable.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How is my data stored?</AccordionTrigger>
              <AccordionContent>
                LabFlow uses offline-first storage (similar to WhatsApp web). All your tasks, protocols, and reagent inventory are stored locally in your browser using IndexedDB/localStorage. This means your data never leaves your device and works completely offline.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I format CSV files for the Data Visualizer?</AccordionTrigger>
              <AccordionContent>
                Your CSV file should have exactly two columns with headers in the first row (e.g., "Time", "Absorbance"). The first column will be plotted on the X-axis, and the second column on the Y-axis. Ensure all data rows contain numeric values.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I print my protocols?</AccordionTrigger>
              <AccordionContent>
                Yes! On the Protocol Generator page, click the "Print" button. The app will automatically hide the input forms and sidebar, generating a clean, printer-friendly layout of your protocol.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I change the theme?</AccordionTrigger>
              <AccordionContent>
                You can toggle between Dark and Light mode using the button at the bottom of the sidebar navigation menu.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
