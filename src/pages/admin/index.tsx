import { DashboardOutlined } from '@mui/icons-material';
import { AdminLayout, ShopLayout } from '../../components'

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout title='Dashboard' subTitle='General info' icon={<DashboardOutlined />}>
      <h1>Admin Page</h1>
    </AdminLayout>
  )
}

export default AdminDashboard;
