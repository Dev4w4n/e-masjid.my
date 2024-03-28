import Front from "../components/Home/Front";
import Stats from "../components/Home/Stats";
import WaktuSolat from "../components/WaktuSolat/waktuSolat";

export default function Home() {
  return (
    <main>
		
      <WaktuSolat />
      <Front />
      <Stats />

    </main>
  );
}
