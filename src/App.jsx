import { useEffect, useState, useRef } from "react"
import Table from "./Table";

// const openF1Endpoint = "https://api.openf1.org/v1/";
const openF1Endpoint = "http://127.0.0.1:8000/openf1/";
// const jolpicaEndpoint = "http://api.jolpi.ca/";
// const jolpicaEndpoint = "http://127.0.0.1:8000/jolpica/";


export default function App() {
  const currYear = new Date().getFullYear();

  const [year, setYear] = useState(currYear);
  const [meetingKey, setMeetingKey] = useState("");
  const [meetingList, setMeetingList] = useState([]);
  const [sessionKey, setSessionKey] = useState("");
  const [sessionList, setSessionList] = useState([]);

  const isMounted1 = useRef(false);

  useEffect(function() {
    fetch(`${openF1Endpoint}meetings/year=${year}`)
    .then((res) => res.json())
    .then((data) => {
      setMeetingKey(data[data.length - 1].meeting_key)
      setMeetingList(data);
    })
  }, [year])
  

  useEffect(function() {
    if(isMounted1.current){
      fetch(`${openF1Endpoint}sessions/meeting_key=${meetingKey}`)
      .then((res) => res.json())
      .then((data) => {
        setSessionKey(data[data.length - 1].session_key)
        setSessionList(data);
      })
    } else{
      isMounted1.current = true;
    }
  }, [meetingKey])

  return (
    <>
      <span>F1</span>
      <select value={year} onChange={(e) => setYear(e.target.value)}>
        <option value={currYear - 2}>{currYear - 2}</option>
        <option value={currYear - 1}>{currYear - 1}</option>
        <option value={currYear}>{currYear}</option>
      </select>
      <select value={meetingKey} onChange={(e) => setMeetingKey(e.target.value)}>
        {meetingList.map((meetingDetails) => (
          <option value={meetingDetails.meeting_key} key={meetingDetails.meeting_key}>{meetingDetails.meeting_name}</option>
        ))}
      </select>
      <select value={sessionKey} onChange={(e) => setSessionKey(e.target.value)}>
        {sessionList.map((sessionDetails) => (
          <option value={sessionDetails.session_key} key={sessionDetails.session_key}>{sessionDetails.session_name}</option>
        ))}
      </select>
      <span>Results</span>
      <Table sessionInfo={sessionList.find(s => s.session_key === parseInt(sessionKey))}/>
  </>
  )
}

