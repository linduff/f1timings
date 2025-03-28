import { useEffect, useState, useRef } from "react"

// const openF1Endpoint = "https://api.openf1.org/v1/";
const openF1Endpoint = "http://127.0.0.1:8000/openf1/";
const jolpicaEndpoint = "http://127.0.0.1:8000/jolpica/";

export default function Table({sessionInfo}) {
    const sessionKey = sessionInfo?.session_key;
    const [lapList, setLapList] = useState([]);
    const [driverList, setDriverList] = useState([]);
    const [pitList, setPitList] = useState([]);
    const [raceControlList, setRaceControlList] = useState([]);
    const [positionList, setPositionList] = useState([]);
  
    useEffect(function() {
        fetch(`${openF1Endpoint}laps/session_key=${sessionKey}`)
        .then((res) => res.json())
        .then((data) => {
            setLapList(data);
        })
    }, [sessionKey])
  
    useEffect(function() {
        fetch(`${openF1Endpoint}drivers/session_key=${sessionKey}`)
        .then((res) => res.json())
        .then((data) => {
          setDriverList(data);
        })
    }, [sessionKey])
  
    useEffect(function() {
        fetch(`${openF1Endpoint}pit/session_key=${sessionKey}`)
        .then((res) => res.json())
        .then((data) => {
          setPitList(data);
        })
    }, [sessionKey])

    useEffect(function() {
        fetch(`${openF1Endpoint}race_control/session_key=${sessionKey}`)
        .then((res) => res.json())
        .then((data) => {
          setRaceControlList(data);
        })
    }, [sessionKey])

    useEffect(function() {
        fetch(`${openF1Endpoint}position/session_key=${sessionKey}`)
        .then((res) => res.json())
        .then((data) => {
          setPositionList(data);
        })
    }, [sessionKey])

    if(sessionInfo?.session_type === "Qualifying") {
        return (
            <table>
                <thead>
                    <tr>
                        <th></th>{/* Position */}
                        <th>Driver</th>
                        <th>Team</th>
                        <th>Q1 Lap Time</th>
                        <th>Q2 Lap Time</th>
                        <th>Q3 Lap Time</th>
                        <th>Gap</th>
                        <th>Laps</th>
                    </tr>
                </thead>
                <tbody>
                    {driverList.map((driver) => (
                    <tr key={driver.driver_number}>
                        <td>1</td>
                        <td>{driver.first_name + " " + driver.last_name}</td>
                        <td>{driver.team_name}</td>
                        <td>1:23.456</td>
                        <td>1:25.456</td>
                        <td>1:22.456</td>
                        <td>+0.112</td>
                        <td>12</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        )
    } else if(sessionInfo?.session_type === "Race") {
        const raceResults = formatRaceClassification(lapList, driverList, pitList, positionList);
        return (
            <table>
                <thead>
                    <tr>
                        <th></th>{/* Position */}
                        <th>Driver</th>
                        <th>Team</th>
                        <th>Gap</th>
                        <th>Pit Stops</th>
                    </tr>
                </thead>
                <tbody>
                    {raceResults.map((driver) => (
                    <tr key={driver.driver_number}>
                        <td>{driver.position}</td>
                        <td>{driver.driver_name}</td>
                        <td>{driver.team_name}</td>
                        <td>{driver.gap}</td>
                        <td>{driver.pit_stops}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        )
    } else {{/* Free Practice */}
        const practiceResults = formatPracticeClassification(lapList, driverList);
        return (
            <table>
                <thead>
                    <tr>
                        <th></th>{/* Position */}
                        <th>Driver</th>
                        <th>Team</th>
                        <th>Lap Time</th>
                        <th>Gap</th>
                        <th>Laps</th>
                    </tr>
                </thead>
                <tbody>
                    {practiceResults.map((driver) => (
                    <tr key={driver.position}>
                        <td>{driver.position}</td>
                        <td>{driver.driver_name}</td>
                        <td>{driver.team_name}</td>
                        <td>{driver.lap_time}</td>
                        <td>{driver.gap}</td>
                        <td>{driver.laps}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        )
    }
  }

  function formatPracticeClassification(lapList, driverList) {
    const practiceResults =  driverList.map((driver) => {
        const driverLaps = lapList.filter((lap) => lap.driver_number === driver.driver_number);
        let fastestLap = 1000;
        for(var i = 0; i < driverLaps.length; i++) {
            if(driverLaps[i].lap_duration !== null && driverLaps[i].lap_duration < fastestLap){
                fastestLap = driverLaps[i].lap_duration
            }
        }
        return {
            position: 0,
            driver_name: driver.first_name + " " + driver.last_name,
            driver_number: driver.driver_number,
            team_name: driver.team_name,
            raw_lap_time: fastestLap,
            lap_time: convertToMMSS(fastestLap),
            gap: 0,
            laps: driverLaps.length
        }
    })
    practiceResults.sort(function(a,b){return a.raw_lap_time - b.raw_lap_time})
    for(var i = 0; i < practiceResults.length; i++) {
        const allFastestLap = practiceResults[0].raw_lap_time;
        practiceResults[i].position = i+1;
        practiceResults[i].gap = practiceResults[i].raw_lap_time === allFastestLap ? "" : "+" + (practiceResults[i].raw_lap_time - allFastestLap).toFixed(3) + "s";
    }
    return practiceResults
}

function formatRaceClassification(lapList, driverList, pitList, positionList) {
    const practiceResults =  driverList.map((driver) => {
        const driverLaps = lapList.filter((lap) => lap.driver_number === driver.driver_number);
        let finalPosition = positionList.filter((p) => p.driver_number === driver.driver_number)
        finalPosition = finalPosition[finalPosition.length - 1]?.position
        let totalTime = 0;
        for(var i = 0; i < driverLaps.length; i++) {
            totalTime += driverLaps[i].lap_duration
        }
        return {
            position: finalPosition,
            driver_name: driver.first_name + " " + driver.last_name,
            driver_number: driver.driver_number,
            team_name: driver.team_name,
            total_time_s: totalTime,
            total_time_mmss: convertToMMSS(totalTime),
            gap: 0,
            laps: driverLaps.length,
            pit_stops: pitList.filter((pit) => pit.driver_number === driver.driver_number).length
        }
    })
    practiceResults.sort(function(a,b){return a.position - b.position})
    for(var i = 0; i < practiceResults.length; i++) {
        practiceResults[i].gap = 0;
    }
    console.log(practiceResults)
    return practiceResults
}

function convertToMMSS(lap) {
    let result = ""
    const hours = Math.floor(lap/3600)
    const minutes = Math.floor((lap - (3600*hours)) / 60);
    const seconds = (lap - (3600*hours) - (minutes*60)).toFixed(3)
    if(hours > 0){
        result += hours + ":"
        if(minutes < 10){
            result += "0"
        }
    }
    return (result + minutes + ":" + seconds)
}
