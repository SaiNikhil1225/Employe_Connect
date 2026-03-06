import EnhancedMyProfile from './EnhancedMyProfile';

interface ProfileProps {
  employeeId?: string;
}

export function Profile({ employeeId }: ProfileProps = {}) {
  return <EnhancedMyProfile employeeId={employeeId} />;
}

