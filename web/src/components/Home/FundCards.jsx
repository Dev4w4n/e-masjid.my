import FundCard from "./FundCard";
import {
  funds_1,
  funds_2,
  funds_3,
  funds_4,
  funds_5,
  funds_6,
  funds_7,
  funds_8,
} from "../../assets/home";

const cards = [
  {
    id: 1,
    price: "234,378,123",
    date: "14.05.24",
    topic: "Call topic - IOT in automated vechiles for fishing purposes",
    image: funds_1,
    circleText: "Discover your match",
  },
  {
    id: 2,
    price: "103,000",
    date: "14.05.24",
    topic:
      "Initiative Proposition - Creating AI driven buses for a better connected Europe. Needed expertise in AI",
    image: funds_2,
    circleText: "LOGIN TO MATCH",
  },
  {
    id: 3,
    price: "25,000,000",
    date: "14.05.24",
    topic:
      "The annual integration of communication systems in the new thales networking system, as part of ECOMSE & Horizon 2020",
    image: funds_3,
    circleText: "DISCOVER HOW MUCH YOU MATCH",
  },
  {
    id: 4,
    price: "3,120,000",
    date: "14.05.24",
    topic: "Program life us expanding its offers for call for proposals",
    image: funds_4,
    circleText: "DISCOVER HOW MUCH YOU MATCH",
  },
  {
    id: 5,
    price: "234,378,123",
    date: "14.05.24",
    topic: "Ms. Afrodita la Carasco application process specialist",
    image: funds_5,
    circleText: "85% match",
  },
  {
    id: 6,
    price: "103,000",
    date: "14.05.24",
    topic: "Mr. Dubi Gerber former EU application evaluator",
    image: funds_6,
    circleText: "95% match",
  },
  {
    id: 7,
    price: "25,000,000",
    date: "14.05.24",
    topic:
      "Initiative Proposition - Creating AI driven buses for a better connected Europe. Needed expertise in AI",
    image: funds_7,
    circleText: "91% match",
  },
  {
    id: 8,
    price: "3,120,000",
    date: "14.05.24",
    topic: "Program life us expanding its offers for call for proposals",
    image: funds_8,
    circleText: "90% match",
  },
];

export default function FundCards() {
  return (
    <article className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 place-items-center lg:gap-14 gap-4">
      {cards.map((card) => (
        <FundCard key={card.id} card={card} />
      ))}
    </article>
  );
}
