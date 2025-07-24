import {CircleMarker, MapContainer, Popup, TileLayer} from 'react-leaflet';
import React, {useEffect, useState} from 'react';
import {Mark, Marks} from "./types";
import 'leaflet/dist/leaflet.css';
import './App.scss';


export default function App() {
    const [center, setCenter] = useState<[number, number] | null>(null);
    const [markers, setMarkers] = useState<JSX.Element[]>([]);

    
    const open = (url: string) => window.open(url, '_blank');

    
    const getMap = (map: string, source: "livelox" | "loggator") => {
        if (source === 'livelox') return map;

        return map.replace('d1d', 'https://d1die33kgxnq4e.cloudfront.net/uploads/map/overlay')
            .replace('$t', 'tile_0_0.jpg');
    }
    

    const openMap = (map: string, source: "livelox" | "loggator") => {
        open(getMap(map, source));
    }

    
    const getColor = (source: 'livelox' | 'loggator') => source === 'livelox' ? 'red' : 'darkorange';

    
    const copy = (x: string) => navigator.clipboard.writeText(x);

    
    const Marker = (mark: Mark, source: 'livelox' | 'loggator') => {
        const map = mark.map;

        return <CircleMarker center={[mark.lat, mark.lon]} pathOptions={{color: getColor(source), fillOpacity: 0}} radius={3}>
            <Popup className="p">
                <div className="pc">
                    <button onClick={() => openMap(map, source)}>Open Map</button>
                    <button onClick={() => copy(`${mark.lat}, ${mark.lon}`)}>Copy Location</button>

                    <img src={getMap(map, source)} alt={mark.name} onClick={() => openMap(map, source)}/>
                </div>
            </Popup>
        </CircleMarker>
    }


    
    const loadJson = async (url: string): Promise<Marks> => {
        // {
        //     "maps": [
        //     {
        //         "name": "ppDB3",
        //         "map": "d1d/4f138275e5419b8788927a36/$t",
        //         "lat": 54.55176,
        //         "lon": -3.40602
        //     },
        //     {
        //         "name": "ppleg5",
        //         "map": "d1d/b2777d1347a39a94d12f2d4d/$t",
        //         "lat": 54.55031,
        //         "lon": -3.40538
        //     },
        //     {
        //         "name": "ppDB2",
        //         "map": "d1d/a4e1f7c184e59af1fe9831a7/$t",
        //         "lat": 54.55167,
        //         "lon": -3.41416
        //     }
        //   ]
        // }
        
        const response = await fetch(url);
        
        if (!response.ok) 
            throw new Error(`HTTP error! status: ${response.status}`);
        
        
        const data = await response.json();
        
        if (!data.maps || !Array.isArray(data.maps)) 
            throw new Error("Invalid data format");
        
        return data.maps as Marks;
    }
    
    // TODO: 1. Update the maps to include new ones, 2. Add "country" field to each map, 3. save it as .db file
    const MapsMarkers = async () => {
        const loggator_ = loadJson('/loggator.json');
        const livelox_ = loadJson('/livelox.json');
        
        const [loggator, livelox] = await Promise.all([loggator_, livelox_]);
        
        const myMarkers_ = loggator.map(x => Marker(x, 'loggator'));
        setMarkers(myMarkers_);

        const chunkSize = 100;
        let i = 0;

        const getChunk = (chunkNumber: number) => {
            const start = chunkNumber * chunkSize;
            const end = start + chunkSize;
            return livelox.slice(start, end);
        }

        const interval = setInterval(() => {
            const chunk = getChunk(i);

            if (chunk.length === 0) {
                clearInterval(interval);
            }

            else {
                const liveLoxMarkers_ = chunk.map(x => Marker(x, 'livelox'));
                setMarkers(current => [...current, ...liveLoxMarkers_]);
            }
            i++;
        }, 100);
    }


    const getLocation = async () => {
        const response = await fetch('https://api.ipregistry.co/?key=tryout');
        const data = await response.json();
        if (data.location)
            return setCenter([data.location.latitude, data.location.longitude]);

        const res = await fetch('https://ipapi.co/json/');
        const d = await res.json();

        if (d.latitude) {
            return setCenter([d.latitude, d.longitude]);
        }

        const res_ = await fetch('https://api.ipify.org?format=json');
        const d_ = await res_.json();

        const res__ = await fetch(`https://ipapi.co/${d_.ip}/json/`);
        const d__ = await res__.json();

        if (d__.latitude)
            return setCenter([d__.latitude, d__.longitude]);

        return setCenter([50, 15]);
    }

    
    useEffect(() => {
        MapsMarkers();
        getLocation();
    }, []);

    
    if (center === null) return <span>Loading...</span>

    
    return <div className="App">
        <MapContainer center={center} zoom={6} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

            {markers}
        </MapContainer>
    </div>
}
