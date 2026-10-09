import AdminClient from '../../components/AdminClient.jsx';
export const metadata = { title: 'Quản trị | DOL THPT' };
export default function AdminPage() { return <div className="container page-wrap"><div className="eyebrow">KHU VỰC QUẢN TRỊ</div><h1>Quản lý kho đề</h1><p className="muted page-intro">Chỉ tài khoản có role admin mới được phép thêm hoặc ẩn đề thi.</p><AdminClient /></div>; }
