import Discover from "../components/Home/Discover";
import Front from "../components/Home/Front";
import Funds from "../components/Home/Funds";
import HowItWorks from "../components/Home/HowItWorks";
import News from "../components/Home/News";
import Quiz from "../components/Home/Quiz";
import Stats from "../components/Home/Stats";
import Stories from "../components/Home/Stories";
import Trusted from "../components/Home/Trusted";

export default function Home() {
  return (
    <main>
      <Front />
      <Stats />
      {/* <Funds />
      <Quiz />
      <Discover />
      <HowItWorks />
      <News />
      <Stories />
      <Trusted /> */}
    </main>
  );
}
