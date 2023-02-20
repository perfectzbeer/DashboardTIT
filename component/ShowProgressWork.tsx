import { useEffect, useRef, useState } from "react";
import supabase from "./supabase";

export const ShowProgressWork = (props: { pdkey: String }) => {
  const { pdkey } = props;
  const mounted = useRef(false);
  const Today = new Date().toISOString().slice(0, 10);
  const [ShowProgress, SetShowProgress] = useState<any>("");
  const lineunit = 'AHPB-01';

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
    let { data, error } = await supabase.rpc("showprogress", {
      propdkey: pdkey,
    });
    if (!error) {
      SetShowProgress(data);
    }
  };

  useEffect(() => {
    mounted.current = true;
    const fetchShowProgress = async () => {
      const { data, error } = await supabase.rpc("showprogress", {
        propdkey: pdkey,
      });
      if (!error) {
        SetShowProgress(data);
      }
    };
    fetchShowProgress();
  }, [pdkey]);

  // Start
  let Ava =
    (ShowProgress[0]?.duration - ShowProgress[0]?.downtime) /
    ShowProgress[0]?.duration;
  if (isNaN(Ava)) Ava = 0;
  let Perfor =
    (ShowProgress[0]?.std * (ShowProgress[0]?.okqty + ShowProgress[0]?.ngqty)) /
    ((ShowProgress[0]?.duration - ShowProgress[0]?.downtime));
  if (isNaN(Perfor)) Perfor = 0;
  let Quality =
    ShowProgress[0]?.okqty / (ShowProgress[0]?.okqty + ShowProgress[0]?.ngqty);
  if (isNaN(Quality)) Quality = 0;
  let oee = Ava * (Perfor / 100) * Quality * 100;
  if (isNaN(oee)) oee = 0;
  let OeePercent = parseFloat(Number(oee).toFixed(2));
  if (isNaN(OeePercent)) OeePercent = 0;

  let Runtime = ShowProgress[0]?.duration - ShowProgress[0]?.downtime;
  if (isNaN(Runtime)) Runtime = 0;
  //* End

  return (
    <div>
      {/* <div className='Distanct'>Availability : {(Ava*100).toFixed(2)}%</div>
          <div className='Distanct'>Performance : {Perfor.toFixed(2)}%</div>
          <div className='Distanct'>Quality : {(Quality*100).toFixed(2)}%</div>
          <div className='Distanct'>OEE : {OeePercent}%</div> */}
      <div className="Distanct">
        FG : {ShowProgress[0]?.okqty}/{ShowProgress[0]?.openqty} (
        {ShowProgress[0]?.percent.toFixed(0)}%)
      </div>
      <div className="Distanct">
        NG : {ShowProgress[0]?.ngqty} ({ShowProgress[0]?.percentng.toFixed(0)}%)
      </div>
      {/* <div className='Distanct'>Duration : {ShowProgress[0]?.duration} Minutes</div>
          <div className='Distanct'>Runtime :  {Runtime} Minutes</div>
          <div className='Distanct'>Downtime : {ShowProgress[0]?.downtime} Minutes</div> */}
    </div>
  );
};
