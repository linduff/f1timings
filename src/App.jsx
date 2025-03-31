import { useEffect, useState, useRef } from "react"
import Table from "./Table";

// const openF1Endpoint = "https://api.openf1.org/v1/";
// const openF1Endpoint = "http://127.0.0.1:8000/openf1/";
// const jolpicaEndpoint = "http://api.jolpi.ca/";
const jolpicaEndpoint = "http://127.0.0.1:8000/jolpica/";

const weekendEvents = [
  {name: "FirstPractice", label: "Practice 1"},
  {name: "SecondPractice", label: "Practice 2"},
  {name: "ThirdPractice", label: "Practice 3"},
  {name: "SprintQualifying", label: "Sprint Qualifying"},
  {name: "SprintShootout", label: "Sprint Shootout"},
  {name: "Qualifying", label: "Qualifying"},
  {name: "Sprint", label: "Sprint"},
  {name: "Race", label: "Race"},
];


export default function App() {
  const currYear = new Date().getFullYear();

  const [year, setYear] = useState(currYear);
  const [round, setRound] = useState(0);
  const [raceList, setRaceList] = useState([]);
  const [event, setEvent] = useState(0);
  const [eventList, setEventList] = useState([]);

  const isMounted = useRef(false);

  function handleEventList() {
    const allEvents = []
    const race = raceList.find((race) => race.round == round)
    for(let i = 0; i < weekendEvents.length; i++) {
      if(race?.hasOwnProperty(weekendEvents[i].name)){
        allEvents.push({name: weekendEvents[i].label, id: i+1, data: race[weekendEvents[i].name]})
      }
    }
    allEvents.push({name: "Race", id: 8, data: {date: race?.date, time: race?.time}})
    allEvents.sort((a,b) => new Date(a?.data.date + "T" + a?.data.time) - new Date(b?.data.date + "T" + b?.data.time))
    console.log(allEvents)
    return allEvents;
  }

  useEffect(function() {
    fetch(`${jolpicaEndpoint}ergast/f1/${year}/races.json`)
    .then((res) => res.json())
    .then((data) => {
      const raceData = data.MRData.RaceTable.Races
      setRaceList(raceData);
      setRound(raceData[0].round);
    })
  }, [year])

  useEffect(function() {
    if(isMounted.current){
      const allEvents = handleEventList();
      setEventList(allEvents);
      setEvent(allEvents[0]?.id)
    } else {
      isMounted.current = true;
    }
    
  }, [round])

  return (
    <>
      <span>F1</span>
      <select value={year} onChange={(e) => setYear(e.target.value)}>
        <option value={currYear - 2}>{currYear - 2}</option>
        <option value={currYear - 1}>{currYear - 1}</option>
        <option value={currYear}>{currYear}</option>
      </select>
      <select value={round} onChange={(e) => setRound(e.target.value)}>
        {raceList.map((raceDetails) => (
          <option value={raceDetails.round} key={raceDetails.round}>{raceDetails.raceName}</option>
        ))}
      </select>
      <select value={event} onChange={(e) => setEvent(e.target.value)}>
        {eventList.map((EventDetails) => (
          <option value={EventDetails.id} key={EventDetails.id}>{EventDetails.name}</option>
        ))}
      </select>
      <span>Results</span>
      <Table year={year} round={round} event={event}/>
  </>
  )
}
