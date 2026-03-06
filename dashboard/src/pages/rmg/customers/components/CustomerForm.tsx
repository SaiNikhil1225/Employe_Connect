import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { CustomerFormData } from '@/types/customer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Save } from 'lucide-react';

const customerSchema = z.object({
  customerNo: z.string().optional().or(z.literal('')),
  customerName: z.string().min(1, 'Customer name is required'),
  hubspotRecordId: z.string().optional().or(z.literal('')),
  industry: z.string().min(1, 'Industry is required'),
  region: z.enum(['UK', 'India', 'USA', 'ME', 'Other']),
  regionHead: z.string().optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => Promise<void>;
  defaultValues?: Partial<CustomerFormData>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CustomerForm({
  onSubmit,
  defaultValues,
  isLoading,
  submitLabel = 'Create Customer',
}: CustomerFormProps) {
  const [nextCustomerNo, setNextCustomerNo] = useState<string>('Auto-generated');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerNo: '',
      customerName: '',
      hubspotRecordId: '',
      industry: '',
      region: undefined,
      regionHead: '',
      status: 'Active' as const,
      ...defaultValues,
    },
  });

  // Fetch next customer number for placeholder
  useEffect(() => {
    const fetchNextCustomerNo = async () => {
      // Only fetch if creating new customer (no defaultValues.customerNo)
      if (!defaultValues?.customerNo) {
        try {
          const response = await axios.get(`${API_URL}/customers?limit=1&sort=-createdAt`);
          const customers = response.data.data;
          let nextNumber = 1;
          if (customers && customers.length > 0 && customers[0].customerNo) {
            const match = customers[0].customerNo.match(/CUST-(\d+)/);
            if (match) {
              nextNumber = parseInt(match[1], 10) + 1;
            }
          }
          setNextCustomerNo(`CUST-${String(nextNumber).padStart(4, '0')}`);
        } catch (error) {
          console.error('Failed to fetch next customer number:', error);
          setNextCustomerNo('Auto-generated');
        }
      }
    };
    fetchNextCustomerNo();
  }, [defaultValues?.customerNo, API_URL]);

  const handleSubmit = async (data: z.infer<typeof customerSchema>) => {
    await onSubmit(data as CustomerFormData);
    // Don't reset form here - let parent component handle it after dialog closes
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Customer Number */}
          <FormField
            control={form.control}
            name="customerNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Number</FormLabel>
                <FormControl>
                  <Input placeholder={nextCustomerNo} {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer Name */}
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corporation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Industry */}
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Financial Services">Financial Services</SelectItem>
                    <SelectItem value="Retail & E-commerce">Retail & E-commerce</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                    <SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem>
                    <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Region */}
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="ME">Middle East</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Region Head */}
          <FormField
            control={form.control}
            name="regionHead"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region Head</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region head" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Anil Kumar">Anil Kumar</SelectItem>
                    <SelectItem value="James Wilson">James Wilson</SelectItem>
                    <SelectItem value="Sarah Mitchell">Sarah Mitchell</SelectItem>
                    <SelectItem value="Mohammed Al-Rashid">Mohammed Al-Rashid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* HubSpot Record ID */}
          <FormField
            control={form.control}
            name="hubspotRecordId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HubSpot Record ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="HS-12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Bottom Action Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t pt-4 mt-6">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
