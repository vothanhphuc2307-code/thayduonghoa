'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/','Trang chủ'],
  ['/de-thi','Kho đề thi'],
  ['/dashboard','Kết quả của tôi']
];

export default function SiteHeader() {
  const pathname = usePathname();
  return <header className="topbar"><div className="container topbar-inner">
    <Link href="/" className="brand" aria-label="DOL THPT trang chủ"><span className="brand-mark">D</span><span><strong>DOL THPT</strong><small>LUYỆN THI TỐT NGHIỆP</small></span></Link>
    <nav className="main-nav" aria-label="Điều hướng chính">{links.map(([href,label]) => <Link key={href} href={href} className={pathname === href ? 'nav-link active' : 'nav-link'}>{label}</Link>)}</nav>
    <div className="top-actions"><Link className="button button-quiet button-small" href="/dang-nhap">Đăng nhập</Link><Link className="button button-primary button-small" href="/dang-ky">Tạo tài khoản <span aria-hidden="true">↗</span></Link></div>
  </div></header>;
}
