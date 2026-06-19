import EducatorDashboard from '@/components/EducatorDashboard';

export const metadata = {
  title: 'Educator Dashboard | ConceptCore Academy',
  description: 'Manage bookings and view student appointments',
};

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20">
      <EducatorDashboard />
    </div>
  );
}