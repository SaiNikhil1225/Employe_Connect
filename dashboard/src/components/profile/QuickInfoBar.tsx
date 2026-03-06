import { Mail, Phone, MapPin, Building2, Briefcase, UserCheck, Calendar, Users } from 'lucide-react';

interface QuickInfoBarProps {
  email: string;
  phone: string;
  location: string;
  department?: string;
  businessUnit?: string;
  reportingManager?: string;
  dottedLineManager?: string;
  joiningDate?: string;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor: string;
  iconBg: string;
}

function InfoItem({ icon, label, value, iconColor, iconBg }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function QuickInfoBar({ email, phone, location, department, businessUnit, reportingManager, dottedLineManager, joiningDate }: QuickInfoBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <InfoItem
        icon={<Mail className="h-5 w-5" />}
        label="Email Address"
        value={email}
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
      />
      <InfoItem
        icon={<Phone className="h-5 w-5" />}
        label="Phone Number"
        value={phone}
        iconColor="text-green-600"
        iconBg="bg-green-50"
      />
      <InfoItem
        icon={<MapPin className="h-5 w-5" />}
        label="Location"
        value={location}
        iconColor="text-purple-600"
        iconBg="bg-purple-50"
      />
      <InfoItem
        icon={<Calendar className="h-5 w-5" />}
        label="Joining Date"
        value={joiningDate || 'N/A'}
        iconColor="text-rose-600"
        iconBg="bg-rose-50"
      />
      <InfoItem
        icon={<Building2 className="h-5 w-5" />}
        label="Department"
        value={department || 'N/A'}
        iconColor="text-indigo-600"
        iconBg="bg-indigo-50"
      />
      <InfoItem
        icon={<Briefcase className="h-5 w-5" />}
        label="Business Unit"
        value={businessUnit || 'N/A'}
        iconColor="text-pink-600"
        iconBg="bg-pink-50"
      />
      <InfoItem
        icon={<UserCheck className="h-5 w-5" />}
        label="Reporting Manager"
        value={reportingManager || 'N/A'}
        iconColor="text-teal-600"
        iconBg="bg-teal-50"
      />
      <InfoItem
        icon={<Users className="h-5 w-5" />}
        label="Dotted Line Manager"
        value={dottedLineManager || 'N/A'}
        iconColor="text-orange-600"
        iconBg="bg-orange-50"
      />
    </div>
  );
}
