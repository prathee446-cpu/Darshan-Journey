import React from 'react';
import { getCurrentUser, isTempleSubAdminUser } from '../../utils/auth';
import ServiceSubAdminLayout from '../../components/ServiceSubAdminLayout';
import ServiceSubAdminDashboard from './ServiceSubAdminDashboard';
import TempleSubAdminLayout from '../../components/TempleSubAdminLayout';
import TempleSubAdminDashboard from './TempleSubAdminDashboard';

/**
 * SubAdminRoot renders the appropriate Sub-Admin Layout & Dashboard
 * according to the authenticated sub-admin's assigned role.
 */
export default function SubAdminRoot() {
  const user = getCurrentUser();

  if (isTempleSubAdminUser(user)) {
    return (
      <TempleSubAdminLayout>
        <TempleSubAdminDashboard />
      </TempleSubAdminLayout>
    );
  }

  return (
    <ServiceSubAdminLayout>
      <ServiceSubAdminDashboard />
    </ServiceSubAdminLayout>
  );
}
