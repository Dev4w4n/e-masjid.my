import React from "react";
import Container from "../Container";
import SectionTitle from "./SectionTitle";
import { how_1, how_2, how_3, how_4 } from "../../assets/home";

const items = [
  {
    id: 1,
    icon: how_1,
    heading: "Find the funding you are interested in",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et venenatis pharetra enim est lectus.",
  },
  {
    id: 2,
    icon: how_2,
    heading: "Access the platform",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et venenatis pharetra enim est lectus.",
  },
  {
    id: 3,
    icon: how_3,
    heading: "Follow the step-by-step guidance",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et venenatis pharetra enim est lectus.",
  },
  {
    id: 4,
    icon: how_4,
    heading: "Let the tech work its magic",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et venenatis pharetra enim est lectus.",
  },
];

export default function HowItWorks() {
  return (
    <section className="my-14">
      <Container>
        <SectionTitle title="how it works" />
        <div className="bg-[#D9CAB3] bg-opacity-30 px-8 py-14 rounded-md mt-8">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 place-items-center lg:gap-14 gap-8">
            {items.map((item) => (
              <div
                className="text-center flex flex-col items-center justify-center"
                key={item.id}
              >
                <img src={item.icon} alt="icon" className="pb-4 w-24" />
                <h1 className="font-bold text-lg py-4">{item.heading}</h1>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
