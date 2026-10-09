import AuthForm from '../../components/AuthForm.jsx';
export const metadata = { title: 'Đăng nhập | DOL THPT' };
export default function LoginPage() { return <div className="auth-page container"><div className="auth-side"><div className="eyebrow light-eyebrow">CHÀO MỪNG BẠN QUAY LẠI</div><h1>Mỗi ngày một bước,<br/><em>gần mục tiêu hơn.</em></h1><p>Lưu lại kết quả luyện tập và tiếp tục hành trình ôn thi của bạn.</p><div className="auth-quote">“Tiến bộ không đến từ một lần cố gắng, mà từ những lần quay lại.”</div></div><div className="auth-card"><AuthForm mode="login" /></div></div>; }
