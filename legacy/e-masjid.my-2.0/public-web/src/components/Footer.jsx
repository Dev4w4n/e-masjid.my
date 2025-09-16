import { logo_2 } from "../assets/home";
import Container from "./Container";
import { config } from "../Config";

export default function Footer() {
  return (
    <footer className="bg-[#212121] py-14 text-white">
      <Container>
        <div className="grid place-items-center sm:text-left text-center lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <img src={logo_2} alt="E-Masjid.My" className="w-65 h-14" />

          <div>
            <h1 className="font-bold capitalize sm:pt-0 pt-8 pb-4">
              Tentang kami
            </h1>
            <ul>
              <li>
                <a
                  href="https://cdn.e-masjid.my/volume/DASAR.PRIVASI.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Dasar Privasi
                </a>
              </li>
              <li>
                <a
                  href=" https://cdn.e-masjid.my/volume/TERMA.PERKHIDMATAN.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Terma Perkhidmatan
                </a>
              </li>
            </ul>
          </div>

          <div className="container">
            <br />
            <span>Powered by </span>
            <a href="https://e-masjid.my" target="_blank" rel="noreferrer">
              E-Masjid.my
            </a>{" "}
            &copy; 2023-2024 ({config.version.BUILD})
          </div>
        </div>
      </Container>
    </footer>
  );
}
