import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import type { HelpdeskTicket } from '@/types/helpdeskNew';
import { sanitizeHtml } from '@/utils/sanitize';

interface TicketDetailsProps {
  ticket: HelpdeskTicket;
}

export function TicketDetails({ ticket }: TicketDetailsProps) {
  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-brand-navy dark:text-gray-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-green" />
          Request Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-brand-slate dark:text-gray-400">Subject</Label>
          <p className="text-sm font-medium text-brand-navy dark:text-gray-100 mt-1">
            {ticket.subject}
          </p>
        </div>

        <div>
          <Label className="text-xs text-brand-slate dark:text-gray-400">Description</Label>
          <div 
            className="text-sm text-brand-navy dark:text-gray-100 mt-1 whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(ticket.description) }}
          />
        </div>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div>
            <Label className="text-xs text-brand-slate dark:text-gray-400">Attachments</Label>
            <div className="mt-2 space-y-1">
              {ticket.attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>{attachment}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

