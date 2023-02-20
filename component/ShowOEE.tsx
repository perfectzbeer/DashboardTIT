import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import supabase from "./supabase";

export const ShowOEE = (props: { pdkey: String, pdstatus: String }) => {
  const { pdkey, pdstatus } = props;
  const [Oeedata, SetOeeData] = useState<any>([]);
  const Today = new Date().toISOString().slice(0, 10);
  const lineunit = 'AHPB-01';
  const [PerData, SetPerData] = useState<any>([]);
  const [ShowProgress, SetShowProgress] = useState<any>("");

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


    //*** */
  const ProductionHistoryOn = supabase
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
  
    let Runtime = ShowProgress[0]?.duration - ShowProgress[0]?.downtime;
    if (isNaN(Runtime)) Runtime = 0;
    //* End
  

  let Ava = Oeedata[0]?.runtime / Oeedata[0]?.duration;
  if (isNaN(Ava)) Ava = 0;
  let Perfor = (Oeedata[0]?.performance+PerforPro)/100; // add Perpro
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
