import { config } from "../Config";
const BUILD = config.version.BUILD;
export default function Copyright() {
  return (
    <div className="text-center pt-3">
      <span className="ms-1 hover:underline">
        <a href="https://cdn.e-masjid.my/volume/DASAR.PRIVASI.pdf" target="_blank" rel="noreferrer">
          Dasar Privasi
        </a>
      </span>
      
      <span className="ms-3 hover:underline">
        <a href=" https://cdn.e-masjid.my/volume/TERMA.PERKHIDMATAN.pdf" target="_blank" rel="noreferrer">
          Terma Perkhidmatan
        </a>
      </span>
      <div className="block">
        <span className="ms-1">
          Powered by{" "}
          <a href="https://e-masjid.my" target="_blank" rel="noreferrer">
            E-Masjid.my
          </a>{" "}
          &copy; 2023-2024 ({BUILD})
        </span>
      </div>
    </div>
  );
}
