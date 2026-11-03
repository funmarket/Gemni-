import React from 'react';
import { AdminConsole } from '@/features/admin';

export const AdminScreen: React.FC = () => {
  return (
    <div className="p-4 max-w-lg mx-auto select-none text-left">
      <AdminConsole />
    </div>
  );
};

export default AdminScreen;
