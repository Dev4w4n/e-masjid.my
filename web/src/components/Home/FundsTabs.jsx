import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import FundCards from "./FundCards";
import SectionTitle from "./SectionTitle";

export default function FundsTabs() {
  return (
    <Tabs className="sm:mt-0 mt-14">
      <div className="flex items-center sm:justify-between justify-center flex-wrap my-8">
        <SectionTitle title="hot funds" />
        <TabList className="flex overflow-auto">
          <Tab className="px-4 py-3 cursor-pointer font-bold sm:text-[16px] text-[14px]">
            All
          </Tab>
          <Tab className="px-4 py-3 cursor-pointer font-bold sm:text-[16px] text-[14px]">
            Bio Technology
          </Tab>
          <Tab className="px-4 py-3 cursor-pointer font-bold sm:text-[16px] text-[14px]">
            Construction
          </Tab>
          <Tab className="px-4 py-3 cursor-pointer font-bold sm:text-[16px] text-[14px]">
            Agriculture
          </Tab>
          <Tab className="px-4 py-3 cursor-pointer font-bold sm:text-[16px] text-[14px]">
            Ecconomy
          </Tab>
        </TabList>
      </div>
      <TabPanel>
        <FundCards />
      </TabPanel>
      <TabPanel>
        <p>something else not available yet</p>
      </TabPanel>
      <TabPanel>
        <FundCards />
      </TabPanel>
      <TabPanel>
        <p>something else not available yet</p>
      </TabPanel>
      <TabPanel>
        <FundCards />
      </TabPanel>
    </Tabs>
  );
}
