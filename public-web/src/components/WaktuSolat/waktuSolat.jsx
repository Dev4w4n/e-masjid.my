import { useState, useEffect } from "react";
import { getTetapanMasjid, fetchSolat } from "./apiSolat";
import { zones } from "./senaraiZon"

export default function WaktuSolat() {
	const [tetapanZon, setTetapanZon] = useState("")
	const [solatToday, setSolatToday] = useState([])
	const [error, setError]= useState(false)

	function getZone(zon) {
		if (zon !== "") {
			return zones.find((zone) => zone.jakimCode === zon).daerah
		}
	}

	function formatHijri(input) {
		if (input !== undefined) {		
		const dateParts = input.split('-');	
		const year = parseInt(dateParts[0], 10);
		const month = parseInt(dateParts[1], 10);
		const day = parseInt(dateParts[2], 10);
		const hijriMonths = {
			1 : "Muharram",
			2 : "Safar",
			3 : "Rabiul Awwal",
			4 : "Rabiul Akhir",
			5 : "Jamadil Awwal",
			6 : "Jamadil Akhir",
			7 : "Rejab",
			8 : "Syaaban",
			9 : "Ramadhan",
			10 : "Syawwal",
			11 : "Zulkaedah",
			12 : "Zulhijjah"
		}
		const output = day + " " + hijriMonths[month] + " " + year + "H"
		return output;
	}
}

	function convertTime(epoch) {
		let date = new Date(epoch * 1000);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	useEffect(() => {
		if (tetapanZon !== "") {
			fetchSolat(tetapanZon)
			.then((response) => {
				const hariIni = new Date().getDate()
				// console.log(response.prayers[hariIni]);
				setSolatToday(response.prayers[hariIni-1])
			})
			.catch((error) => {
				console.error(error)
				setError(true)
			})
		}
	},[tetapanZon])

	useEffect(() => {
		getTetapanMasjid()
		.then((response) => {
			response.forEach((tetapan) => {
				if (tetapan.kunci === 'ZON_MASJID') {
					setTetapanZon(tetapan.nilai)
				}
			})
		})
		.catch((error) => {
			console.error(error)
			setError(true)
		})
	  }, [])


	return (
		<div>
		
		{!error && (

			<div style={{display:"flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap:10, border:"solid", borderWidth:2, borderRadius:5, width:"80%", margin:"auto", padding:10, marginBottom:10}}>

			<div style={{textAlign:"center"}}>
				<h1 style={{fontWeight:"bold"}}>Waktu Solat bagi Zon {tetapanZon} - { getZone(tetapanZon) }</h1>
				<div style={{fontSize:"0.9em"}}>{new Date().toLocaleDateString()} : {formatHijri(solatToday.hijri)}</div>
			</div>
			
			<div style={{
				display:"flex", 
				flexDirection: "row", 
				alignItems: "center", 
				justifyContent: "space-around",
				width:"100%",
				textAlign:"center",
			}}>
					
				<div>
					<div>Subuh</div>
					<div>{convertTime(solatToday.fajr)}</div>
				</div>

				<div>
					<div>Syuruk</div>
					<div>{convertTime(solatToday.syuruk)}</div>
				</div>

				<div>
					<div>Zuhur</div>
					<div>{convertTime(solatToday.dhuhr)}</div>
				</div>

				<div>
					<div>Asar</div>
					<div>{convertTime(solatToday.asr)}</div>
				</div>

				<div>
					<div>Maghrib</div>
					<div>{convertTime(solatToday.maghrib)}</div>
				</div>

				<div>
					<div>Isyak</div>
					<div>{convertTime(solatToday.isha)}</div>
				</div>
				
			</div>
		</div>
		)}
	</div>
)}