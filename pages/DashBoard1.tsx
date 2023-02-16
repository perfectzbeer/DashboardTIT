import React, { useEffect, useRef, useState} from 'react';
import Paper from '@mui/material/Paper';
import {Chart, ChartItem} from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Grid from '@mui/material/Grid';
import GaugeChart from "react-gauge-chart";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import supabase from '../component/supabase';

function ShowProgress(props: { pdkey:String}){
    const { pdkey } = props;
    const mounted = useRef(false);
    const [ShowProgress, SetShowProgress] = useState<any>('');
    
    const ProductionHistory = supabase.channel('custom-progress-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Production_history', filter: 'Production_unit=eq.AHPB-01' },
      (payload) => {
        fetchShowProgress();
      }
    )
    .subscribe()

    const fetchShowProgress = async() => {
        let {data, error} = await supabase.rpc("showprogress", {
            propdkey: pdkey
        })
        if(!error){
          SetShowProgress(data);
        }
    };

    useEffect(() => {
        mounted.current = true;
        const fetchShowProgress = async() => {
            const {data, error} = await supabase.rpc("showprogress", {
                propdkey: pdkey
            })
            if(!error){
                SetShowProgress(data);
            }
        };
        fetchShowProgress();
        return () => {
            mounted.current = false;
        };
    },[pdkey])
   
    let ProPercent = parseFloat(Number(ShowProgress[0]?.percent).toFixed(2));
    if(isNaN(ProPercent)) ProPercent = 0;

    return(
        <div>
            <div className='NameGauge'>Progresscls</div>
            <GaugeChart id="gauge-progress" 
                nrOfLevels={1} 
                percent={(ProPercent/100)} 
                arcsLength={[(ProPercent/100), ((100-ProPercent)/100)]}
                colors={["#5BE12C", 'rgb(250, 214, 209, 0.15)']} 
                needleBaseColor={'#FFFFFF'}
                needleColor={'#FFFFFF'}
                textColor={'#FFFFFF '}
            />
        </div>        
    )
}

function ShowProgressWork(props: { pdkey:String}){
    const { pdkey } = props;
    const mounted = useRef(false);
    const Today = new Date().toISOString().slice(0, 10);
    const [ShowProgress, SetShowProgress] = useState<any>('');

    const ProductionHistory = supabase.channel('progress-work-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Production_history', filter: 'Production_unit=eq.AHPB-01' },
      (payload) => {
        fetchShowProgress();
      }
    )
    .subscribe()

    const fetchShowProgress = async() => {
        let {data, error} = await supabase.rpc("showprogress", {
            propdkey: pdkey
        })
        if(!error){
          SetShowProgress(data);
        }
    };

    useEffect(() => {
        mounted.current = true;
        const fetchShowProgress = async() => {
            const {data, error} = await supabase.rpc("showprogress", {
                propdkey: pdkey
            })
            if(!error){
                SetShowProgress(data);
            }
        };
        fetchShowProgress();

    },[pdkey])

    // Start
    let Ava = ((ShowProgress[0]?.duration-ShowProgress[0]?.downtime)/ShowProgress[0]?.duration);
    if(isNaN(Ava)) Ava = 0;
    let Perfor = ((ShowProgress[0]?.std*(ShowProgress[0]?.okqty+ShowProgress[0]?.ngqty)))/((ShowProgress[0]?.duration-ShowProgress[0]?.downtime)/ShowProgress[0]?.manpower);
    if(isNaN(Perfor)) Perfor = 0;
    let Quality = (ShowProgress[0]?.okqty/(ShowProgress[0]?.okqty+ShowProgress[0]?.ngqty));
    if(isNaN(Quality)) Quality = 0;
    let oee = (Ava*(Perfor/100)*Quality)*100;
    if(isNaN(oee)) oee = 0;
    let OeePercent = parseFloat(Number(oee).toFixed(2));
    if(isNaN(OeePercent)) OeePercent = 0;

    let Runtime = ShowProgress[0]?.duration-ShowProgress[0]?.downtime;
    if(isNaN(Runtime)) Runtime = 0;
    //* End

    return(
        <div>
        {/* <div className='Distanct'>Availability : {(Ava*100).toFixed(2)}%</div>
        <div className='Distanct'>Performance : {Perfor.toFixed(2)}%</div>
        <div className='Distanct'>Quality : {(Quality*100).toFixed(2)}%</div>
        <div className='Distanct'>OEE : {OeePercent}%</div> */}
        <div className='Distanct'>FG : {ShowProgress[0]?.okqty}/{ShowProgress[0]?.openqty} ({ShowProgress[0]?.percent}%)</div>
        <div className='Distanct'>NG : {ShowProgress[0]?.ngqty} ({ShowProgress[0]?.percentng}%)</div>
        {/* <div className='Distanct'>Duration : {ShowProgress[0]?.duration} Minutes</div>
        <div className='Distanct'>Runtime :  {Runtime} Minutes</div>
        <div className='Distanct'>Downtime : {ShowProgress[0]?.downtime} Minutes</div> */}
        </div>
    )
}

function ShowDowntime(){
    const [Downtime, SetDTData] = useState<any>([]);
    const Today = new Date().toISOString().slice(0, 10);

    const DowntimeRecord = supabase.channel('custom-downtime-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Downtime_record' },
      (payload) => {
        fetchDataDT();
      }
    )
    .subscribe()

    const fetchDataDT = async() => {
        const { data, error } = await supabase.rpc('showdtline', {
            prounit: 'AHPB-01', pdate: Today
        })
        if(!error){
            SetDTData(data);
        }
    };

    useEffect(() => {
        const fetchDataDT = async() => {
            const { data, error } = await supabase.rpc('showdtline', {
                prounit: 'AHPB-01', pdate: Today
            })
            if(!error){
                SetDTData(data);
            }
        };
        fetchDataDT();
    },[])

    const dataDT = {
        labels: Downtime.map((row: {dcode: String, duration: Number, durationline: Number, alldt: Number}) => (row.dcode+" "+(Number(row.duration)/Number(row.alldt)*100).toFixed(1)+"%")),
        datasets: [{  
            label: 'Down time reason',
            data: Downtime.map((row: {duration: Number}) => (row.duration)),
        }],
        position: 'top',
    };
  
    const canvasDT = useRef(
        typeof document !=="undefined" ? document.createElement("canvas") : null
    );
  
    useEffect(() => {
        const ctx = canvasDT.current?.getContext('2d') as ChartItem
        
        const config = {
            type: 'pie',
            data: dataDT,
            width: 1,
            height: 1,
            
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Down time Reason',
                        color: ['rgb(255, 255, 255)'],
                        font: {
                            size: 20,
                            // style: 'italic',
                            family: 'serif'
                          }
                    },
                    datalabels: {
                        color :'white',
                        formatter:(value: number, context: { chart: { data: { datasets: { data: any; }[]; }; }; }) => {
                            const datapoints = context.chart.data.datasets[0].data;
                            function totalSum(){
                                return Downtime[0]?.alldt;
                            }
                            const totalvalue = datapoints.reduce(totalSum, 0);
                            const percentageValue = (value/totalvalue*100).toFixed(1);
                            return percentageValue+"%";
                            // return percentageValue+"% ("+value+" Min.)";
                        },
                        anchor: 'end',
                        align: 'end',
                        offset: 1
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: ['rgb(255, 255, 255)'],
                            // arc: true,
                        }
                    },
                },
            },
            plugins: [ChartDataLabels],
        }
        const myLineChart = new Chart(ctx, config as any);
        return function cleanup() {
            myLineChart.destroy();
        };
    },[Downtime]);

    return(
        <div>
            <canvas ref={canvasDT} />
        </div>
    )
}

function ShowPerformance(){
    const [PerData, SetPerData] = useState<any>([]);
    const Today = new Date().toISOString().slice(0, 10);
    
    const ProductionHistory = supabase.channel('custom-perf-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Production_history', filter: 'Production_unit=eq.AHPB-01' },
      (payload) => {
        fetchDataPer();
      }
    )
    .subscribe()

    const fetchDataPer = async() => {
        const { data, error } = await supabase.rpc('showoeeline', {
            prounit: 'AHPB-01', pdate: Today
        })
        if(!error){
            SetPerData(data);
        }
    };

    useEffect(() => {
        const fetchDataPer = async() => {
            const { data, error } = await supabase.rpc('showoeeline', {
                prounit: 'AHPB-01', pdate: Today
            })
            if(!error){
                SetPerData(data);
            }
        };
        fetchDataPer();
    },[])

    let Ava = (PerData[0]?.runtime/PerData[0]?.duration);
    if(isNaN(Ava)) Ava = 0;
    let Perfor = (PerData[0]?.performance);
    if(isNaN(Perfor)) Perfor = 0;
    let Quality = (PerData[0]?.okqty/(PerData[0]?.okqty+PerData[0]?.ngqty));
    if(isNaN(Quality)) Quality = 0;

    return(
        <div>
            <div className='NameGauge'>Performance</div>
            <GaugeChart id="gauge-chart2" 
                nrOfLevels={10} 
                percent={(Perfor)} 
                colors={["#EA4228", "#5BE12C"]} 
                needleBaseColor={'#FFFFFF'}
                needleColor={'#FFFFFF'}
                textColor={'#FFFFFF '}
            />
            <div className='NameGauge'>Availability</div>
            <GaugeChart id="gauge-chart3" 
                nrOfLevels={10} 
                percent={(Ava)} 
                colors={["#EA4228", "#5BE12C"]} 
                needleBaseColor={'#FFFFFF'}
                needleColor={'#FFFFFF'}
                textColor={'#FFFFFF '}
            />               
        </div>
    )
}

function ShowOEE(){
    const [Oeedata, SetOeeData] = useState<any>([]);
    const Today = new Date().toISOString().slice(0, 10);

    const ProductionHistory = supabase.channel('oee-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Production_history', filter: 'Production_unit=eq.AHPB-01' },
      (payload) => {
        fetchDataOEE();
      }
    )
    .subscribe()

    const fetchDataOEE = async() => {
        const { data, error } = await supabase.rpc('showoeeline', {
            prounit: 'AHPB-01', pdate: Today
        })
        if(!error){
            SetOeeData(data);
        }
    };

    useEffect(() => {
        const fetchDataOEE = async() => {
            const { data, error } = await supabase.rpc('showoeeline', {
                prounit: 'AHPB-01', pdate: Today
            })
            if(!error){
                SetOeeData(data);
            }
        };
        fetchDataOEE();
    },[])
        
    let Ava = (Oeedata[0]?.runtime/Oeedata[0]?.duration);
    if(isNaN(Ava)) Ava = 0;
    let Perfor = (Oeedata[0]?.performance);
    if(isNaN(Perfor)) Perfor = 0;
    let Quality = (Oeedata[0]?.okqty/(Oeedata[0]?.okqty+Oeedata[0]?.ngqty));
    if(isNaN(Quality)) Quality = 0;
    let oee = (Ava*Perfor*Quality)*100;
    if(isNaN(oee)) oee = 0;
    let OeePercent = parseFloat(Number(oee).toFixed(2));
    if(isNaN(OeePercent)) OeePercent = 0;

    return(
        <div>
            <div className='NameGauge'>Quality</div>
            <GaugeChart id="gauge-chart4" 
                nrOfLevels={10} 
                percent={Quality} 
                colors={["#EA4228", "#5BE12C"]} 
                needleBaseColor={'#FFFFFF'}
                needleColor={'#FFFFFF'}
                textColor={'#FFFFFF '}
            />
            <div className='NameGauge'>OEE</div>
            <GaugeChart id="gauge-chart4" 
                nrOfLevels={10} 
                percent={(OeePercent/100)} 
                colors={["#EA4228", "#5BE12C"]} 
                needleBaseColor={'#FFFFFF'}
                needleColor={'#FFFFFF'}
                textColor={'#FFFFFF '}
            />
        </div>
    )
}

function ShowWO(){
    const mounted = useRef(false);
    const [GetWoLine, SetWoLine] = useState<any>([]);
    const Today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        mounted.current = true;
        const fetchWoLine = async() => {
            const { data, error } = await supabase.from('Production_history')
            .select('Work_order_id,Item_number,Availability_percent,Performance_percent,Quality_percent,OEE_percent')
            .eq('Production_unit','AHPB-01').eq('Production_date',Today).order('Begin_time');
            if(!error){
                SetWoLine(data);
            }
        };
        fetchWoLine();
        return () => {
            mounted.current = false;
        };
    },[])
    
    return(
        <>
        <TableContainer component={Paper} >
        <Table sx={{ minWidth: 400, backgroundColor: '#313131', color: '#FFFFFF', }} aria-label="simple table">
            <TableHead >
            <TableRow >
                <TableCell style={{color:'#FFFFFF'}}>Work order</TableCell>
                <TableCell style={{color:'#FFFFFF'}}>Item number</TableCell>
                <TableCell style={{color:'#FFFFFF'}} align="right">Availability</TableCell>
                <TableCell style={{color:'#FFFFFF'}} align="right">Performance</TableCell>
                <TableCell style={{color:'#FFFFFF'}} align="right">Quality</TableCell>
                <TableCell style={{color:'#FFFFFF'}} align="right">OEE</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {GetWoLine.map((row: any) => (
                <TableRow                          
                key={row.Work_order_id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, color: '#FFFFFF' }}
                >
                <TableCell style={{color:'#FFFFFF'}} component="th" scope="row">{row.Work_order_id}</TableCell>
                <TableCell style={{color:'#FFFFFF'}}>{row.Item_number}</TableCell>
                <TableCell style={{color:'#FFFFFF'}} align="right">{(row.Availability_percent*100).toFixed(2)}%</TableCell>
                <TableCell style={{color:'#FFFFFF'}} align="right">{(row.Performance_percent*100).toFixed(2)}%</TableCell>
                <TableCell style={{color:'#FFFFFF'}} align="right">{(row.Quality_percent*100).toFixed(2)}%</TableCell>
                <TableCell style={{color:'#FFFFFF'}} align="right">{(row.OEE_percent*100).toFixed(2)}%</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
        </>
    )
}

function ShowDTRealTime(props: {pdkey:String, pdstatus:String}){
    const { pdkey, pdstatus } = props;
    const [ShowDTRT, SetDTRT] = useState<any>('');
    const Today = new Date().toISOString().slice(0, 10);
    const [dateState, useDateState] = useState(new Date());
    const [TimeState, SetTimeState] = useState<any>('');
    let bgDT = '';

    useEffect(() => {
        setInterval(() => 
            useDateState(new Date())
        , 1000);
    }, [])
    
    useEffect(() => {
        const fetchDTRealTime = async() => {
            const {data, error} = await supabase.rpc("dtrealtime", {
                propdkey: pdkey
            })
            if(!error){
                SetDTRT(data);
            }
        };
        fetchDTRealTime();
    },[pdstatus])
    
    const st = new Date(Today+' '+ShowDTRT[0]?.dtstart);
    const en = new Date(dateState);
    
    useEffect(() => {
        let diff = en.getTime()-st.getTime()
        let msec = diff;
        let hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
        let mm = Math.floor(msec / 1000 / 60);
            msec -= mm * 1000 * 60;
        let ss = Math.floor(msec / 1000);
            msec -= ss * 1000;
    
        let DiffTime = hh.toString().padStart(2,"0")+ ":" + mm.toString().padStart(2,"0") + ":"+ss.toString().padStart(2,"0");
    
        SetTimeState(DiffTime);
    }, [en])
    
    if(pdstatus==='Downtime'){
        return(
            <div>
                <style jsx global>{` 
                .DTNONE{
                    display: none;
                }
                .DTSHOW{
                    font-size: 16px;
                    display: block;
                    text-align: center;
                    border-radius: 5px;
                    padding: 4px;
                    margin-top: 3px;
                    font-weight:Bold;
                    color: #FFF;
                    background-color: rgb(118,16,16,0.5);
                    position: relative;
                }
            `}</style>
            <div className='FootDowntime'>
                <div className='DTSHOW'>
                    {ShowDTRT[0]?.dtreason}
                    <div style={{padding:1, fontSize:24}}>
                    {TimeState}
                    </div>
                </div>
            </div>
            </div>
        )
    }else{
        return(
            <div></div>
        )
    }
}

export default function ShowDashBoard1(){
    const [ShowUnit, SetShowUnit] = useState<any>('');
    const [loadings, setLoadings] = useState(false);

    useEffect(() => {
        document.addEventListener('click', (e) => {
            document.documentElement.requestFullscreen().catch((e) => { });
        });
    },[])
    // Data Line
    const ProductionUnitGroup = supabase.channel('custom-pdunit-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Production_unit_group', filter: 'PD_line=eq.AHPB-01' },
      (payload) => {
        fetchShowUnit();
      }
    )
    .subscribe()

    const fetchShowUnit = async() => {
        const {data, error} = await supabase.rpc("showline", {
            prounit: 'AHPB-01' 
        })
        if(!error){
          SetShowUnit(data);     
        }
    };

    useEffect(() => {
        const fetchShowUnit = async() => {
            const {data, error} = await supabase.rpc("showline", {
                prounit: 'AHPB-01'
            })
            if(!error){
              SetShowUnit(data);
            }
        };
        fetchShowUnit();
        setLoadings(false);
    },[])
    // End Data Line

    if(loadings){
        return(
            <div>Loading .... </div>
        )
    }
    
    return(
        <div>
        <style jsx global>{`
            body {
                font-size: 16px;
                margin: 0px;
                background-color: #093989;
                background-image: url("/grid.png");
                background-image: linear-gradient(to bottom, rgba(9, 57, 137, 0.95) 10%, rgba(9, 57, 137, 0.95) 80%), url("/grid.png");
            }
            .HeaderCompany{ 
                text-align:center;
                background-color: rgb(49, 49, 49,0.8);
                padding: 0px;
                padding-bottom: 1px;
                margin-bottom: 2px;
            } 
            .Graph{
                margin-left: auto;
                margin-right: auto;
                position: top;
            }  
            .Machine{
                font-size: 16px;
                border-radius:5px;
                padding: 10px;
                font-weight:Bold;
                text-align: center;
                margin: 1px;
                color: #FFF;
                background-color: rgb(49, 49, 49,0.5);
                position: relative;
            }
            .BgGraph{
                border-radius:5px;
                padding: 10px;
                font-weight:Bold;
                text-align: center;
                margin: 5px;
                color: #FFF;
                background-color: rgb(49, 49, 49,0.15);
                position: relative;
            }
            .Offline{
                border-radius:5px;
                padding: 2px;
                margin-top: 0px;
                font-weight:Bold;
                color: #000;
                text-align: center;
                background-color: #DDDDDD;
                position: relative;
            }
            .Online{
                border-radius:5px;
                padding: 2px;
                margin-top: 0px;
                font-weight:Bold;
                color: #FFF;
                text-align: center;
                background-color: #15A401;
                position: relative;
            }
            .Downtime{
                border-radius:5px;
                padding: 2px;
                margin-top: 0px;
                font-weight:Bold;
                color: #FFF;
                text-align: center;
                background-color: #FF0000;
                position: relative;
            }
            .Distanct{
                padding: 0.5px;
                color: #FFF;
            }
            .FootDetail{
                height: 0px;
            }
            .FootDowntime{
                padding-bottom: 0px;
            }
            .NameGauge{
                text-align:center;
                color:#FFFFFF;
                font-size:20px;
                font-weight:bold;
            }
        `}</style> 
        <div className={`${ShowUnit[0]?.pdstatus}`} style={{height:40, fontSize:32, borderRadius:0, marginTop:-5}}>
            {ShowUnit[0]?.pdunit}
        </div>
        <Grid container rowSpacing={0} columnSpacing={0} paddingTop={0.5} paddingLeft={2}>
            <Grid item xs={7}>
                <Grid container spacing={1} item lg={12} md={12} xs={12}>
                    <Grid item xs={6}>
                        <div className={'Machine'}>ASSEMBLY
                        <div className='Distanct'>Work order : {ShowUnit[0]?.woid}</div>
                        <div className='Distanct'>Item : {ShowUnit[0]?.itemnumber}</div>
                        <ShowProgressWork pdkey={String(ShowUnit[0]?.pdkey)} />
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <ShowProgress pdkey={String(ShowUnit[0]?.pdkey)} />
                    </Grid>
                    <Grid item xs={6}>
                        <ShowPerformance />   
                    </Grid>
                    <Grid item xs={6}>
                        <ShowOEE />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={5}>
                <Grid item xs={12}>
                    <Grid >
                        <ShowDTRealTime pdkey={String(ShowUnit[0]?.pdkey)} pdstatus={String(ShowUnit[0]?.pdstatus)} />
                        <div className={'BgGraph'}>
                            <ShowDowntime />
                        </div>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} >
                <div className={'Machine'}>
                    <div className={`${ShowUnit[0]?.pdstatus}`}>History work today</div>
                    <ShowWO />
                </div>
            </Grid>
        </Grid>
        </div>
    )
}