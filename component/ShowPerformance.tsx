import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import { ShowProgressWork } from "./ShowProgressWork";
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
        fetchShowProgress();
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

  let Perfor = 0;
  let Ava = 0;
  let AvaTemp = 0;
  if(ShowProgress.length>0){
    AvaTemp = (Number(PerData[0]?.runtime)+(ShowProgress[0]?.duration - ShowProgress[0]?.downtime)) / (Number(PerData[0]?.duration)+ShowProgress[0]?.duration);
    Ava = parseFloat(Number(AvaTemp*100).toFixed(0));
    if (isNaN(Ava)) Ava = 0;

    Perfor = parseFloat(Number(PerData[0]?.performance).toFixed(0));
    let PerforPro = (ShowProgress[0]?.std * (ShowProgress[0]?.okqty + ShowProgress[0]?.ngqty)) / ((ShowProgress[0]?.duration - ShowProgress[0]?.downtime));
    if (isNaN(PerforPro)) PerforPro = 0;

    Perfor = parseFloat(Number((Perfor+PerforPro)/2).toFixed(0)); 
    if (isNaN(Perfor)) Perfor = 0;
  }else{
    AvaTemp = Number(PerData[0]?.runtime)/Number(PerData[0]?.duration);
    Ava = parseFloat(Number(AvaTemp*100).toFixed(0));
    if (isNaN(Ava)) Ava = 0;

    Perfor = parseFloat(Number(PerData[0]?.performance).toFixed(0));
    if (isNaN(Perfor)) Perfor = 0;
  }
 
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