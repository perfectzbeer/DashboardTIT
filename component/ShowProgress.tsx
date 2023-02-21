import { useEffect, useRef, useState } from "react";
import GaugeChart from "react-gauge-chart";
import supabase from "./supabase";

export const ShowProgress = (props: { pdkey: String }) => {
  const { pdkey } = props;
  const [ShowProgress, SetShowProgress] = useState<any>("");
  const lineunit = 'AHPB-01';

  const ProductionHistory = supabase
    .channel("custom-progress-channel")
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

  // useEffect(() => {
  //   document.addEventListener("keydown", function (event) {
  //     if (event.key === "Enter") {
  //         const fetchShowProgress = async () => {
  //           const { data, error } = await supabase.rpc("showprogress", {
  //             propdkey: pdkey,
  //           });
  //           if (!error) {
  //             SetShowProgress(data);
  //           }
  //         };
  //         fetchShowProgress();
  //     }
  //   });
    
  //     document.addEventListener("click", (e) => {
  //       const fetchShowProgress = async () => {
  //         const { data, error } = await supabase.rpc("showprogress", {
  //           propdkey: pdkey,
  //         });
  //         if (!error) {
  //           SetShowProgress(data);
  //         }
  //       };
  //       fetchShowProgress();
  //     });
    
  // },[])

  useEffect(() => {
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

  let ProPercent = parseFloat(Number(ShowProgress[0]?.percent).toFixed(0));
  if (isNaN(ProPercent)) ProPercent = 0;

  return (
    <div>
      <div className="NameGauge">Progress</div>
      <GaugeChart
        id="gauge-progress"
        nrOfLevels={1}
        percent={ProPercent / 100}
        arcsLength={[ProPercent / 100, (100 - ProPercent) / 100]}
        colors={["#5BE12C", "rgb(250, 214, 209, 0.15)"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
      />
    </div>
  );
};
