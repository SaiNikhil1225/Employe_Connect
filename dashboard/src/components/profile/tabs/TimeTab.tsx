import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  DollarSign,
  ArrowRight,
  Star,
  Trophy,
  Award,
  UserCog,
  Cake
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'anniversary' | 'salary' | 'role' | 'manager' | 'achievement' | 'spoc' | 'birthday';
  date: string;
  year: number;
  title: string;
  description?: string;
  previousValue?: string;
  newValue?: string;
  badge?: string;
}

interface TimeTabProps {
  totalTenure?: string;
  joiningDate?: string;
  events?: TimelineEvent[];
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'anniversary':
      return <Trophy className="h-3 w-3" />;
    case 'salary':
      return <DollarSign className="h-3 w-3" />;
    case 'role':
      return <Briefcase className="h-3 w-3" />;
    case 'manager':
      return <Users className="h-3 w-3" />;
    case 'spoc':
      return <UserCog className="h-3 w-3" />;
    case 'achievement':
      return <Award className="h-3 w-3" />;
    case 'birthday':
      return <Cake className="h-3 w-3" />;
    default:
      return <Star className="h-3 w-3" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'anniversary':
      return {
        marker: 'bg-amber-500',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        cardBorder: 'border-amber-200',
        cardBg: 'bg-amber-50/30',
      };
    case 'salary':
      return {
        marker: 'bg-emerald-500',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        cardBorder: 'border-emerald-200',
        cardBg: 'bg-emerald-50/30',
      };
    case 'role':
      return {
        marker: 'bg-blue-500',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        cardBorder: 'border-blue-200',
        cardBg: 'bg-blue-50/30',
      };
    case 'manager':
      return {
        marker: 'bg-purple-500',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
        cardBorder: 'border-purple-200',
        cardBg: 'bg-purple-50/30',
      };
    case 'spoc':
      return {
        marker: 'bg-indigo-500',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
        cardBorder: 'border-indigo-200',
        cardBg: 'bg-indigo-50/30',
      };
    case 'achievement':
      return {
        marker: 'bg-pink-500',
        iconBg: 'bg-pink-50',
        iconColor: 'text-pink-600',
        cardBorder: 'border-pink-200',
        cardBg: 'bg-pink-50/30',
      };
    case 'birthday':
      return {
        marker: 'bg-rose-500',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
        cardBorder: 'border-rose-200',
        cardBg: 'bg-rose-50/30',
      };
    default:
      return {
        marker: 'bg-gray-500',
        iconBg: 'bg-gray-50',
        iconColor: 'text-gray-600',
        cardBorder: 'border-gray-200',
        cardBg: 'bg-gray-50/30',
      };
  }
};

export default function TimeTab({
  events = [],
}: TimeTabProps) {
  // If no events provided, show empty state
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Trophy className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No timeline events available</p>
        <p className="text-sm text-gray-400 mt-1">Events will appear here as they occur</p>
      </div>
    );
  }

  // Group events by year
  const eventsByYear = events.reduce((acc, event) => {
    if (!acc[event.year]) {
      acc[event.year] = [];
    }
    acc[event.year].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  const years = Object.keys(eventsByYear).sort((a, b) => Number(b) - Number(a));

  // Year badge colors
  const yearColors = [
    'bg-blue-500 text-white',
    'bg-purple-500 text-white',
    'bg-emerald-500 text-white',
    'bg-orange-500 text-white',
    'bg-pink-500 text-white',
    'bg-cyan-500 text-white',
  ];

  const getYearColor = (index: number) => {
    return yearColors[index % yearColors.length];
  };

  return (
    <div className="relative max-w-3xl">
      {/* Timeline Container */}
      <div className="relative">
        {years.map((year, yearIndex) => (
          <div key={year} className="relative">
            {/* Year Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge 
                variant="secondary" 
                className={`text-[10px] font-medium px-2 py-0.5 ${getYearColor(yearIndex)} hover:opacity-90`}
              >
                {year}
              </Badge>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Events for this year */}
            <div className="space-y-4 mb-6">
              {eventsByYear[Number(year)].map((event, eventIndex) => {
                const colors = getEventColor(event.type);
                const isLastEvent = yearIndex === years.length - 1 && 
                                   eventIndex === eventsByYear[Number(year)].length - 1;

                return (
                  <div key={event.id} className="relative flex gap-3 group">
                    {/* Timeline Spine and Marker */}
                    <div className="relative flex flex-col items-center">
                      {/* Vertical Line (before marker) - connects from previous year */}
                      {eventIndex === 0 && yearIndex !== 0 && (
                        <div className="absolute -top-4 w-0.5 h-4 bg-gray-200"></div>
                      )}
                      
                      {/* Event Marker */}
                      <div className={`relative z-10 h-7 w-7 rounded-full ${colors.iconBg} border-2 border-white shadow-sm flex items-center justify-center ring-1 ring-gray-100 transition-all`}>
                        <div className={colors.iconColor}>
                          {getEventIcon(event.type)}
                        </div>
                      </div>
                      
                      {/* Vertical Line (after marker) */}
                      {!isLastEvent && (
                        <div className="absolute top-7 w-0.5 h-full bg-gray-200"></div>
                      )}
                    </div>

                    {/* Event Card */}
                    <div className="flex-1 pb-1">
                      <div className={`rounded-lg border ${colors.cardBorder} ${colors.cardBg} p-3 shadow-sm hover:shadow transition-all`}>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                              {event.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {event.date}
                            </p>
                          </div>
                          
                          {event.badge && (
                            <Badge 
                              variant="secondary" 
                              className={`${colors.iconBg} ${colors.iconColor} border ${colors.cardBorder} font-medium text-xs px-2 py-0.5`}
                            >
                              {event.badge}
                            </Badge>
                          )}
                        </div>

                        {/* Event-specific content */}
                        {event.type === 'role' && event.previousValue && event.newValue && (
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Badge variant="outline" className="font-normal text-xs px-2 py-0.5">
                              {event.previousValue}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <Badge variant="outline" className={`font-medium ${colors.iconColor} text-xs px-2 py-0.5`}>
                              {event.newValue}
                            </Badge>
                          </div>
                        )}

                        {event.type === 'manager' && event.previousValue && event.newValue && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                            <span className="text-gray-600">From</span>
                            <Badge variant="secondary" className="font-normal text-xs px-2 py-0.5">
                              {event.previousValue}
                            </Badge>
                            <span className="text-gray-600">to</span>
                            <Badge variant="secondary" className={`font-medium ${colors.iconColor} text-xs px-2 py-0.5`}>
                              {event.newValue}
                            </Badge>
                          </div>
                        )}

                        {event.type === 'spoc' && event.previousValue && event.newValue && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                            <span className="text-gray-600">From</span>
                            <Badge variant="secondary" className="font-normal text-xs px-2 py-0.5">
                              {event.previousValue}
                            </Badge>
                            <span className="text-gray-600">to</span>
                            <Badge variant="secondary" className={`font-medium ${colors.iconColor} text-xs px-2 py-0.5`}>
                              {event.newValue}
                            </Badge>
                          </div>
                        )}

                        {event.description && (
                          <p className="text-xs text-gray-600 mt-1.5">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
