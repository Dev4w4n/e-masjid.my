import { useEffect, useState } from "react";
import { getTetapanNamaMasjid } from "../../service/Tetapan/TetapanMasjidApi";
import { useEffect, useState } from "react";
import { getTetapanNamaMasjid } from "../../service/Tetapan/TetapanMasjidApi";

export default function Front() {
  
  const [namaMasjid, setNamaMasjid] = useState("")
  
  useEffect(() => {
    async function loadNamaMasjid() {
      try {
        const response = await getTetapanNamaMasjid();
        setNamaMasjid(response.nilai);
      } catch (error) {
        console.error("Error fetching nama masjid:", error);
      }
    }
    loadNamaMasjid();
  }, []);
  
  useEffect(() => {
    document.title = `E-Masjid - ${namaMasjid || 'Masjid Demo'}`;
  }, [namaMasjid]);
  
  
  const [namaMasjid, setNamaMasjid] = useState("")
  
  useEffect(() => {
    async function loadNamaMasjid() {
      try {
        const response = await getTetapanNamaMasjid();
        setNamaMasjid(response.nilai);
      } catch (error) {
        console.error("Error fetching nama masjid:", error);
      }
    }
    loadNamaMasjid();
  }, []);
  
  useEffect(() => {
    document.title = `E-Masjid - ${namaMasjid || 'Masjid Demo'}`;
  }, [namaMasjid]);
  
  return (
    <section className="z-10">
      <div className="sm:w-11/12 mx-auto">
      <div
          className="py-8 sm:rounded-3xl relative w-full h-[620px] bg-homefrontbg bg-cover lg:bg-center bg-no-repeat bg-left"
        >
          <article className="flex items-end absolute top-[30%] left-[24px] lg:left-auto lg:right-0 lg:w-[30%] border-l-2 h-1/2 px-2 border-l-white">
            <div className="text-white text-[26px] w-full">
              <p>{namaMasjid}</p>
              <p> <span className="font-bold">e-Masjid.my</span></p>              
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
