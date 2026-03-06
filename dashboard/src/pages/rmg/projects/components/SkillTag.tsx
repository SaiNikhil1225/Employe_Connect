import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillTagProps {
  skill: string;
  className?: string;
}

export function SkillTag({ skill, className }: SkillTagProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal",
        className
      )}
    >
      {skill}
    </Badge>
  );
}

interface SkillTagsProps {
  skills: string[];
  maxVisible?: number;
  className?: string;
}

export function SkillTags({ skills, maxVisible = 2, className }: SkillTagsProps) {
  const visibleSkills = skills.slice(0, maxVisible);
  const remainingCount = skills.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visibleSkills.map((skill, index) => (
        <SkillTag key={index} skill={skill} />
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
