import { useContext } from 'react';
import { ModulePermissionsContext } from '@/contexts/ModulePermissionsContext';

export const useModulePermissions = () => useContext(ModulePermissionsContext);
