'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const response = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin',
        body:JSON.stringify({ name,email,password })
      });
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(data.error || 'Không thể xử lý yêu cầu.');
      window.location.assign(data.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch(e) { setError(e.message || 'Có lỗi xảy ra.'); }
    finally { setBusy(false); }
  }
  return <><div className="auth-card-heading"><div className="eyebrow">TÀI KHOẢN DOL THPT</div><h2>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h2><p>{isRegister ? 'Tạo tài khoản học viên miễn phí.' : 'Tiếp tục hành trình luyện tập của bạn.'}</p></div><form className="form-stack" onSubmit={submit}>
    {isRegister && <label>Họ và tên<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Nguyễn Minh Anh"/></label>}
    <label>Email<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ban@example.com"/></label>
    <label>Mật khẩu<input required type="password" minLength={isRegister?10:1} maxLength={128} autoComplete={isRegister?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={isRegister?'Tối thiểu 10 ký tự':'Nhập mật khẩu'}/></label>
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    <button className="button button-primary button-full button-large" disabled={busy}>{busy ? 'Đang xử lý…' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'} <span>→</span></button>
  </form><p className="auth-switch">{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <Link href={isRegister?'/dang-nhap':'/dang-ky'}>{isRegister?'Đăng nhập':'Tạo tài khoản'}</Link></p><p className="auth-disclaimer">Không có tài khoản mẫu mặc định. Mật khẩu được băm ở máy chủ; tài khoản học viên không thể tự cấp quyền admin.</p></>;
}
