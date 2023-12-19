export default function FundCard({ key, card }) {
  return (
    <div className="h-[550px] w-[320px]" key={key}>
      <div className="relative rounded-xl overflow-hidden">
        <img src={card.image} alt="fund1" />
        <div className="absolute top-4 uppercase right-4 leading-tight font-bold w-[70px] h-[70px] flex items-center justify-center bg-white text-black rounded-full text-[10px] text-center">
          {card.circleText}
        </div>
      </div>
      <div className="flex items-center gap-4 my-4 px-2">
        <h1 className="bg-[#5c807162] px-3 py-1 rounded-md text-[#6D9886] text-[17px] font-medium">
          € {card.price}
        </h1>
        <p className="text-xs font-bold text-[#6D9886]">
          <i className="fa fa-clock text-xs text-[14px]" /> {card.date}
        </p>
        <i className="fa fa-heart text-xs text-[#6D9886] text-[14px] ml-auto" />
      </div>
      <h2 className="font-bold text-[17px] px-2 hover:text-[#6D9886] transition-colors cursor-pointer">
        {card.topic}
      </h2>
    </div>
  );
}
