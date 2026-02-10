import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { SkillTags } from './SkillTag';
import { UtilizationBar } from './UtilizationBar';
import { Badge } from '@/components/ui/badge';

interface Resource {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  department: string;
  skills: string[];
  utilization: number;
  status: 'Active' | 'On Leave' | 'Inactive';
}

interface ResourceTableProps {
  resources: Resource[];
  isLoading?: boolean;
}

export function ResourceTable({ resources, isLoading }: ResourceTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading resources...</div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground font-medium">No resources found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add resources to this project to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Resource</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id} className="hover:bg-muted/50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={resource.avatar} alt={resource.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(resource.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{resource.name}</div>
                    <div className="text-sm text-muted-foreground">{resource.role}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{resource.department}</span>
              </TableCell>
              <TableCell>
                <SkillTags skills={resource.skills} maxVisible={2} />
              </TableCell>
              <TableCell>
                <div className="min-w-[180px]">
                  <UtilizationBar value={resource.utilization} />
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary"
                  className={getStatusColor(resource.status)}
                >
                  {resource.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
