import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import supabase from "../component/supabase";
import { ShowPerformance } from "../component/ShowPerformance";
import { ShowProgress } from "../component/ShowProgress";
import { ShowProgressWork } from "../component/ShowProgressWork";
import { ShowDowntime } from "../component/ShowDowntime";
import { ShowOEE } from "../component/ShowOEE";
import { ShowWO } from "../component/ShowWO";
import { ShowDTRealTime } from "../component/ShowDTRealTime";

export default function ShowDashBoard1() {
  const [ShowUnit, SetShowUnit] = useState<any>("");
  const [loadings, setLoadings] = useState(false);

  useEffect(() => {
    document.addEventListener("click", (e) => {
      document.documentElement.requestFullscreen().catch((e) => {});
    });
  }, []);
  // Data Line
  const ProductionUnitGroup = supabase
    .channel("custom-pdunit-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Production_unit_group",
        filter: "PD_line=eq.AHPB-01",
      },
      (payload) => {
        fetchShowUnit();
      }
    )
    .subscribe();

  const fetchShowUnit = async () => {
    const { data, error } = await supabase.rpc("showline", {
      prounit: "AHPB-01",
    });
    if (!error) {
      SetShowUnit(data);
    }
  };

  useEffect(() => {
    const fetchShowUnit = async () => {
      const { data, error } = await supabase.rpc("showline", {
        prounit: "AHPB-01",
      });
      if (!error) {
        SetShowUnit(data);
      }
    };
    fetchShowUnit();
    setLoadings(false);
  }, []);
  // End Data Line

  if (loadings) {
    return <div>Loading .... </div>;
  }

  return (
    <div>
      <style jsx global>{`
        body {
          font-size: 16px;
          margin: 0px;
          background-color: #093989;
          background-image: url("/grid.png");
          background-image: linear-gradient(
              to bottom,
              rgba(9, 57, 137, 0.95) 10%,
              rgba(9, 57, 137, 0.95) 80%
            ),
            url("/grid.png");
        }
        .HeaderCompany {
          text-align: center;
          background-color: rgb(49, 49, 49, 0.8);
          padding: 0px;
          padding-bottom: 1px;
          margin-bottom: 2px;
        }
        .Graph {
          margin-left: auto;
          margin-right: auto;
          position: top;
        }
        .Machine {
          font-size: 16px;
          border-radius: 5px;
          padding: 10px;
          font-weight: Bold;
          text-align: center;
          margin: 1px;
          color: #fff;
          background-color: rgb(49, 49, 49, 0.5);
          position: relative;
        }
        .BgGraph {
          border-radius: 5px;
          padding: 10px;
          font-weight: Bold;
          text-align: center;
          margin: 5px;
          color: #fff;
          background-color: rgb(49, 49, 49, 0.15);
          position: relative;
        }
        .Offline {
          border-radius: 5px;
          padding: 2px;
          margin-top: 0px;
          font-weight: Bold;
          color: #000;
          text-align: center;
          background-color: #dddddd;
          position: relative;
        }
        .Online {
          border-radius: 5px;
          padding: 2px;
          margin-top: 0px;
          font-weight: Bold;
          color: #fff;
          text-align: center;
          background-color: #15a401;
          position: relative;
        }
        .Downtime {
          border-radius: 5px;
          padding: 2px;
          margin-top: 0px;
          font-weight: Bold;
          color: #fff;
          text-align: center;
          background-color: #ff0000;
          position: relative;
        }
        .Distanct {
          text-align: left;
          padding: 0.5px;
          padding-left: 10px;
          color: #fff;
        }
        .FootDetail {
          height: 0px;
        }
        .FootDowntime {
          padding-bottom: 0px;
        }
        .NameGauge {
          text-align: center;
          color: #ffffff;
          font-size: 20px;
          font-weight: bold;
        }
        .NameGroup{
          width: 33%;
          float: left;
          padding-left: 10px;
          text-align: left;
          display: inline;
        }
        .NameUnit{
          width: 33%;
          float: left;
          text-align: center;
          display: inline;
        }
      `}</style>
      <div
        className={`${ShowUnit[0]?.pdstatus}`}
        style={{ height: 48, fontSize: 34, borderRadius: 0, paddingTop:4 }}
      >
        <div className="NameGroup">ASSEMBLY</div>
        <div className="NameUnit">{ShowUnit[0]?.pdunit}</div>
      </div>
      <Grid
        container
        rowSpacing={0}
        columnSpacing={0}
        paddingTop={0.5}
        paddingLeft={2}
      >
        <Grid item xs={7}>
          <Grid container spacing={1} item lg={12} md={12} xs={12}>
            <Grid item xs={6}>
              <div className={"Machine"}>
                <div className="Distanct">Work order : {ShowUnit[0]?.woid}</div>
                <div className="Distanct">Item : {ShowUnit[0]?.itemnumber}</div>
                <ShowProgressWork pdkey={String(ShowUnit[0]?.pdkey)} />
              </div>
            </Grid>
            <Grid item xs={6}>
              <ShowProgress pdkey={String(ShowUnit[0]?.pdkey)} />
            </Grid>
            <Grid item xs={6}>
              <ShowPerformance pdstatus={String(ShowUnit[0]?.pdstatus)} />
            </Grid>
            <Grid item xs={6}>
              <ShowOEE pdstatus={String(ShowUnit[0]?.pdstatus)} />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={5}>
          <Grid item xs={12}>
            <Grid>
              <ShowDTRealTime
                pdkey={String(ShowUnit[0]?.pdkey)}
                pdstatus={String(ShowUnit[0]?.pdstatus)}
              />
              <div className={"BgGraph"}>
                <ShowDowntime />
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <div className={"Machine"}>
            <div className={`${ShowUnit[0]?.pdstatus}`}>History work today</div>
            <ShowWO />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
