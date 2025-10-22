export default function Footer() {
  return (
    <footer className="footer-islamic">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="footer-section-title">Tentang Kami</h3>
            <p className="text-sm leading-relaxed">
              E-Masjid.My adalah platform digital untuk menghubungkan komuniti
              masjid dengan perniagaan dan perkhidmatan halal di seluruh
              Malaysia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer-section-title">Pautan Pantas</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="footer-link">
                  Laman Utama
                </a>
              </li>
              <li>
                <a
                  href={`${process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3000"}/register`}
                  className="footer-link"
                >
                  Daftar
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="footer-section-title">Hubungi Kami</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: info@emasjid.my</li>
              <li>Tel: +60 3-xxxx xxxx</li>
              <li>Malaysia</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6 text-center text-sm">
          <p>
            © {new Date().getFullYear()} E-Masjid.My. Hak Cipta Terpelihara.
          </p>
        </div>
      </div>
    </footer>
  );
}
