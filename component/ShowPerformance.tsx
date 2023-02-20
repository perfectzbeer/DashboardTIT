import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import supabase from "./supabase";

export const ShowPerformance = (props: { pdkey: String, pdstatus: String }) => {
  const { pdkey, pdstatus } = props;
  const [PerData, SetPerData] = useState<any>([]);
  const Today = new Date().toISOString().slice(0, 10);
  const lineunit = 'AHPB-01';
  const [ShowProgress, SetShowProgress] = useState<any>("");

  const ProductionHistoryP = supabase
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
        fetchData();
      }
    )
    .subscribe();

  const fetchData = async () => {
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
  
  //*** */
  const ProductionHistory = supabase
    .channel("progress-work-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Production_history",
        filter: "Production_unit=eq."+lineunit,
      },
      (payload) => {
        fetchShowProgress();
      }
    )
    .subscribe();

  const fetchShowProgress = async () => {
    let { data, error } = await supabase.rpc("onprogress", {
      propdkey: pdkey,
    });
    if (!error) {
      SetShowProgress(data);
    }
  };

  useEffect(() => {
    const fetchShowProgress = async () => {
      const { data, error } = await supabase.rpc("onprogress", {
        propdkey: pdkey,
      });
      if (!error) {
        SetShowProgress(data);
      }
    };
    fetchShowProgress();
  }, [pdkey]);

  // Start
  let AvaPro = (ShowProgress[0]?.duration - ShowProgress[0]?.downtime) / ShowProgress[0]?.duration;
  if (isNaN(AvaPro)) AvaPro = 0;
  let PerforPro =
    (ShowProgress[0]?.std * (ShowProgress[0]?.okqty + ShowProgress[0]?.ngqty)) /
    ((ShowProgress[0]?.duration - ShowProgress[0]?.downtime));
  if (isNaN(PerforPro)) PerforPro = 0;
  console.log(AvaPro)
  let Runtime = ShowProgress[0]?.duration - ShowProgress[0]?.downtime;
  if (isNaN(Runtime)) Runtime = 0;
  //* End

  let AvaTemp = Number(PerData[0]?.runtime)/Number(PerData[0]?.duration);
  let Ava = parseFloat(Number(AvaTemp*100).toFixed(0));
  if (isNaN(Ava)) Ava = 0;
  let Perfor = parseFloat(Number(PerData[0]?.performance).toFixed(0));
  Perfor = Perfor+PerforPro
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