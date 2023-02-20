import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import supabase from "./supabase";

export const ShowOEE = (props: { pdstatus: String }) => {
  const { pdstatus } = props;
  const [Oeedata, SetOeeData] = useState<any>([]);
  const Today = new Date().toISOString().slice(0, 10);
  const lineunit = 'AHPB-01';

  const ProductionHistory = supabase
    .channel("oee-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Production_history",
        filter: "Production_unit=eq."+lineunit,
      },
      (payload) => {
        fetchDataOEE();
      }
    )
    .subscribe();

  const fetchDataOEE = async () => {
    const { data, error } = await supabase.rpc("showoeeline", {
      prounit: lineunit,
      pdate: Today,
      pstatus: pdstatus
    });
    if (!error) {
      SetOeeData(data);
    }
  };

  useEffect(() => {
    const fetchDataOEE = async () => {
      const { data, error } = await supabase.rpc("showoeeline", {
        prounit: lineunit,
        pdate: Today,
        pstatus: pdstatus
      });
      if (!error) {
        SetOeeData(data);
      }
    };
    fetchDataOEE();
  }, []);

  let Ava = Oeedata[0]?.runtime / Oeedata[0]?.duration;
  if (isNaN(Ava)) Ava = 0;
  let Perfor = Oeedata[0]?.performance/100;
  if (isNaN(Perfor)) Perfor = 0;
  let Quality = Oeedata[0]?.okqty / (Oeedata[0]?.okqty + Oeedata[0]?.ngqty);
  if (isNaN(Quality)) Quality = 0;
  let oee = Ava * Perfor * Quality * 100;
  if (isNaN(oee)) oee = 0;
  let OeePercent = parseFloat(Number(oee).toFixed(0));
  if (isNaN(OeePercent)) OeePercent = 0;
  
  return (
    <div>
      <div className="NameGauge">Quality</div>
      <GaugeChart
        id="gauge-chart4"
        nrOfLevels={10}
        percent={Quality}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
      />
      <div className="NameGauge">OEE</div>
      <GaugeChart
        id="gauge-chart4"
        nrOfLevels={10}
        percent={OeePercent / 100}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
      />
    </div>
  );
};
