import { t1, t2, t3, t4, t5, t6, t7 } from "../../assets/home/trusted";
import SectionTitle from "./SectionTitle";

export default function Trusted() {
  return (
    <section className="mt-14 bg-[#6D9886] rounded-md py-24">
      <div className="flex items-center md:justify-around px-4 gap-4 flex-wrap justify-center">
        <SectionTitle title="trusted by" classes="opacity-50" />
        <div className="lg:w-1/2 w-full flex flex-wrap items-center lg:justify-start justify-center gap-4 lg:mt-0 mt-4">
          <img src={t1} alt="broken" className="w-30 h-10 mb-4" />
          <img src={t2} alt="broken" className="w-30 h-10 mb-4" />
          <img src={t3} alt="broken" className="w-30 h-10 mb-4" />
          <img src={t4} alt="broken" className="w-30 h-10 mb-4" />
          <img src={t5} alt="broken" className="w-30 h-10 mb-4" />
          <img src={t6} alt="broken" className="w-30 h-10 mb-4" />
          <img src={t7} alt="broken" className="w-30 h-10" />
        </div>
      </div>
    </section>
  );
}
