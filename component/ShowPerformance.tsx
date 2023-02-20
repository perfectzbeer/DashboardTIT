import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import supabase from "./supabase";

export const ShowPerformance = (props: { pdstatus: String }) => {
  const { pdstatus } = props;
  const [PerData, SetPerData] = useState<any>([]);
  const Today = new Date().toISOString().slice(0, 10);
  const lineunit = 'AHPB-01';
  const ProductionHistory = supabase
    .channel("custom-perf-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Production_history",
        filter: "Production_unit=eq."+lineunit,
      },
      (payload) => {
        fetchDataPer();
      }
    )
    .subscribe();

  const fetchDataPer = async () => {
    const { data, error } = await supabase.rpc("showoeeline", {
      prounit: lineunit,
      pdate: Today,
      pstatus: pdstatus
    });
    if (!error) {
      SetPerData(data);
    }
  };

  useEffect(() => {
    const fetchDataPer = async () => {
      const { data, error } = await supabase.rpc("showoeeline", {
        prounit: lineunit,
        pdate: Today,
        pstatus: pdstatus
      });
      if (!error) {
        SetPerData(data);
      }
    };
    fetchDataPer();
  }, []);
  
  let AvaTemp = Number(PerData[0]?.runtime)/Number(PerData[0]?.duration);
  let Ava = parseFloat(Number(AvaTemp*100).toFixed(0));
  if (isNaN(Ava)) Ava = 0;
  let Perfor = parseFloat(Number(PerData[0]?.performance).toFixed(0));
  if (isNaN(Perfor)) Perfor = 0;

  return (
    <div>
      <div className="NameGauge">Performance</div>
      <GaugeChart
        id="gauge-chart2"
        nrOfLevels={10}
        percent={Perfor/100}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
      />{" "}
      <div className="NameGauge">Availability</div>
      <GaugeChart
        id="gauge-chart3"
        nrOfLevels={10}
        percent={Ava/100}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
      />
    </div>
  );
};
