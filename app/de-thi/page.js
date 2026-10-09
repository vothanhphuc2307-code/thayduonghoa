import ExamsClient from '../../components/ExamsClient.jsx';
export const metadata = { title: 'Kho đề thi | DOL THPT' };
export default function ExamsPage() { return <div className="container page-wrap"><div className="page-title-row"><div><div className="eyebrow">KHO LUYỆN TẬP</div><h1>Đề thi & bài luyện</h1><p className="muted">Các đề minh họa được đánh dấu rõ. Đề thật chỉ được thêm khi có nguồn dữ liệu hợp lệ.</p></div></div><ExamsClient /></div>; }
