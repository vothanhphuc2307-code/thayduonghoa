import './globals.css';
import SiteHeader from '../components/SiteHeader.jsx';

export const metadata = {
  title: 'DOL THPT — Luyện thi tốt nghiệp THPT',
  description: 'Nền tảng luyện tập và làm đề thi thử THPT. Dự án phục dựng độc lập; dữ liệu mẫu được ghi rõ.',
  applicationName: 'DOL THPT Rebuild'
};

export default function RootLayout({ children }) {
  return <html lang="vi"><body><SiteHeader /><main className="site-main">{children}</main><footer className="site-footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} DOL THPT · Bản phục dựng độc lập</span><span>Dữ liệu mẫu không phải dữ liệu gốc đã khôi phục.</span></div></footer></body></html>;
}
