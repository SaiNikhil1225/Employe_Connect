import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PreviewData {
  udaNumber: string;
  name: string;
  description: string;
  parentUDA?: string;
  type: string;
  billable: string;
  projectRequired: string;
  active: string;
  status: "valid" | "error";
  errors?: string[];
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file");
        return;
      }
      setFile(selectedFile);
      setShowPreview(false);
      setPreviewData([]);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/uda-configurations/bulk-preview", formData);

      setPreviewData(response.data.preview);
      setShowPreview(true);

      const errorCount = response.data.preview.filter(
        (item: PreviewData) => item.status === "error"
      ).length;

      if (errorCount > 0) {
        toast.warning(`${errorCount} row(s) have validation errors`);
      } else {
        toast.success("All rows are valid!");
      }
    } catch (error: any) {
      console.error("Preview error:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to preview file";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    // Check if preview has errors
    const hasErrors = previewData.some((item) => item.status === "error");
    if (hasErrors) {
      toast.error("Please fix all validation errors before uploading");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/uda-configurations/bulk-upload", formData);

      toast.success(
        `Successfully uploaded ${response.data.created} UDA configuration(s)`
      );
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to upload file";
      
      const errorDetails = error.response?.data?.details;
      
      toast.error(errorMessage);
      
      if (errorDetails) {
        console.error("Error details:", errorDetails);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = [
      "udaNumber",
      "name",
      "description",
      "parentUDA",
      "type",
      "billable",
      "projectRequired",
      "active",
    ];
    const exampleRow = [
      "UDA001",
      "Sample UDA",
      "This is a sample UDA configuration",
      "",
      "Category",
      "Billable",
      "Y",
      "Y",
    ];

    const csvContent = [
      headers.join(","),
      exampleRow.join(","),
      // Add a few more example rows
      [
        "UDA002",
        "Another Sample",
        "Another example",
        "UDA001",
        "Sub-Category",
        "Non-Billable",
        "N",
        "Y",
      ].join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uda_configurations_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Template downloaded successfully");
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk Upload UDA Configurations
          </DialogTitle>
          <DialogDescription>
            Upload multiple UDA configurations at once using an Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Download the template file, fill in your UDA data, and upload
                it here
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Upload Excel File</Label>
            <div className="flex gap-2">
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="cursor-pointer"
              />
              <Button
                onClick={handlePreview}
                disabled={!file || isUploading}
                variant="secondary"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Preview"
                )}
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Preview Table */}
          {showPreview && previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Preview ({previewData.length} rows)</Label>
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    {previewData.filter((item) => item.status === "valid").length}{" "}
                    Valid
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    {previewData.filter((item) => item.status === "error").length}{" "}
                    Errors
                  </Badge>
                </div>
              </div>

              <div className="border rounded-md max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>UDA Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Project Req.</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((item, index) => (
                      <TableRow
                        key={index}
                        className={
                          item.status === "error" ? "bg-red-50" : "bg-green-50"
                        }
                      >
                        <TableCell>
                          {item.status === "valid" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.udaNumber}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.billable}</TableCell>
                        <TableCell>{item.projectRequired}</TableCell>
                        <TableCell>{item.active}</TableCell>
                        <TableCell>
                          {item.errors && item.errors.length > 0 && (
                            <ul className="text-xs text-red-600 list-disc list-inside">
                              {item.errors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              !file ||
              !showPreview ||
              isUploading ||
              previewData.some((item) => item.status === "error")
            }
            className="bg-primary hover:bg-primary/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {previewData.length} Configuration(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
