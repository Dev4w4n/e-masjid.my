import { useState } from "react";
import random from "../../assets/random.png";

export default function SearchBar() {
  const [focusBox, setFocusBox] = useState(false);
  const focusHandler = () => {
    setFocusBox(!focusBox);
  };

  return (
    <div className="relative z-40">
      <input
        type="text"
        placeholder="Search by Funds, Consortium, category"
        onFocus={focusHandler}
        onBlur={focusHandler}
        className="bg-white bg-opacity-50 focus:bg-opacity-100 border-[1px] border-white outline-none px-4 py-2 rounded-md sm:w-[500px] w-[300px] placeholder-white"
      />
      {focusBox && (
        <div className="bg-white px-4 py-4 absolute top-[2.4rem] left-0 w-full text-[12px] border-t-[1px] border-t-black search_drop_shadow rounded-br-md rounded-bl-md">
          <h2 className="uppercase text-gray-400 font-bold">trending topics</h2>
          <div className="my-4 flex items-center gap-2 flex-wrap">
            <p className="bg-[#F6F6F6] rounded-lg px-2 py-1">
              Bio - Technology
            </p>
            <p className="bg-[#F6F6F6] rounded-lg px-2 py-1">Construction</p>
            <p className="bg-[#F6F6F6] rounded-lg px-2 py-1">Drug discovery</p>
            <p className="bg-[#F6F6F6] rounded-lg px-2 py-1">Agriculture</p>
            <p className="bg-[#F6F6F6] rounded-lg px-2 py-1">Ecconomy</p>
            <p className="bg-[#F6F6F6] rounded-lg px-2 py-1">Environment</p>
          </div>
          <div>
            <h2 className="uppercase text-gray-400 font-bold py-4">projects</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 flex-wrap border-[1px] rounded-md p-2 cursor-pointer hover:bg-gray-600 hover:text-white border-gray-500">
                <img
                  src={random}
                  alt="random"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="font-light capitalize text-base">
                    Environment
                  </h1>
                  <p className="opacity-40">102 Projects</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap border-[1px] rounded-md p-2 cursor-pointer hover:bg-gray-600 hover:text-white border-gray-500">
                <img
                  src={random}
                  alt="random"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="font-light capitalize text-base">
                    Environment
                  </h1>
                  <p className="opacity-40">102 Projects</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap border-[1px] rounded-md p-2 cursor-pointer hover:bg-gray-600 hover:text-white border-gray-500">
                <img
                  src={random}
                  alt="random"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="font-light capitalize text-base">
                    Environment
                  </h1>
                  <p className="opacity-40">102 Projects</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap border-[1px] rounded-md p-2 cursor-pointer hover:bg-gray-600 hover:text-white border-gray-500">
                <img
                  src={random}
                  alt="random"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="font-light capitalize text-base">
                    Environment
                  </h1>
                  <p className="opacity-40">102 Projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
