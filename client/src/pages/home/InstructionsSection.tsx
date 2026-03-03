import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface InstructionsSectionProps {
  instructions: string[]
}

export default function InstructionsSection({ instructions }: InstructionsSectionProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="instructions" className="border-none">
        <AccordionTrigger className="py-2 text-sm font-medium">
          Instructions ({instructions.length} steps)
        </AccordionTrigger>
        <AccordionContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
