import { logo_2 } from "../assets/home";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="bg-[#212121] py-14 text-white">
      <Container>
        <div className="grid place-items-center sm:text-left text-center lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <img src={logo_2} alt="E-Masjid.My" className="w-65 h-14" />
          <div className="sm:mt-0 mt-14">
            <h1 className="font-bold capitalize sm:pt-0 pt-8 pb-4">Tentang Masjid</h1>
            <ul>
              <li>
                <a href="#">Senarai Ahli AJK</a>
              </li>
              <li>
                <a href="#">Hubungi Kami</a>
              </li>
              <li>
                <a href="#">Download Borang</a>
              </li>
            </ul>
          </div>
          <div>
            <h1 className="font-bold capitalize sm:pt-0 pt-8 pb-4">Aktiviti</h1>
            <ul>
              <li>
                <a href="#">Nuzul Al-Quran</a>
              </li>
              <li>
                <a href="#">Maulidurrasul</a>
              </li>
              <li>
                <a href="#">Ramadhan</a>
              </li>
            </ul>
          </div>
          <div>
            <h1 className="font-bold capitalize sm:pt-0 pt-8 pb-4">Sosmed</h1>
            <ul>
              <li>
                <a href="#">Tiktok</a>
              </li>
              <li>
                <a href="#">Twitter</a>
              </li>
              <li>
                <a href="#">Facebook</a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
