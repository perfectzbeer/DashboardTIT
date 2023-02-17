import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import supabase from "./supabase";

export const ShowPerformance = () => {
  const [PerData, SetPerData] = useState<any>([]);
  const Today = new Date().toISOString().slice(0, 10);

  const ProductionHistory = supabase
    .channel("custom-perf-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Production_history",
        filter: "Production_unit=eq.AHPB-01",
      },
      (payload) => {
        fetchDataPer();
      }
    )
    .subscribe();

  const fetchDataPer = async () => {
    const { data, error } = await supabase.rpc("showoeeline", {
      prounit: "AHPB-01",
      pdate: Today,
    });
    if (!error) {
      SetPerData(data);
    }
  };

  useEffect(() => {
    const fetchDataPer = async () => {
      const { data, error } = await supabase.rpc("showoeeline", {
        prounit: "AHPB-01",
        pdate: Today,
      });
      if (!error) {
        SetPerData(data);
        console.log(data)
      }
    };
    fetchDataPer();
  }, []);

  let Ava = PerData[0]?.runtime / PerData[0]?.duration;
  if (isNaN(Ava)) Ava = 0;
  let Perfor = PerData[0]?.performance;
  if (isNaN(Perfor)) Perfor = 0;
  let Quality = PerData[0]?.okqty / (PerData[0]?.okqty + PerData[0]?.ngqty);
  if (isNaN(Quality)) Quality = 0;

  return (
    <div>
      <div className="NameGauge">Performance</div>
      <GaugeChart
        id="gauge-chart2"
        nrOfLevels={10}
        percent={Perfor}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
      />{" "}
      <div className="NameGauge">Availability</div>
      <GaugeChart
        id="gauge-chart3"
        nrOfLevels={10}
        percent={Ava}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
      />
    </div>
  );
};
