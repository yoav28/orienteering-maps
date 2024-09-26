import React, {useEffect, useState} from 'react';
import {CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvent, useMapEvents} from 'react-leaflet';
import {allMarkers, Mark, Marks} from "./Server";
import {livelox} from "./Livelox";
import {LatLngBounds} from "leaflet";
import 'leaflet/dist/leaflet.css';
import './App.scss';


export default function App() {
    const [center, setCenter] = useState<[number, number] | null>(null);

    const open = (url: string) => window.open(url, '_blank');

    const getMarkersWithinBounds = (m: Marks, bounds: LatLngBounds) => m.filter(x => bounds.contains([x.lat, x.lon]));


    const Marker = (mark: Mark, source: 'livelox' | 'loggator') => {
        const color = source === 'livelox' ? 'purple' : 'orange';
        // const color = 'purple';

        const getMap = (map: string) => {
            // d1d - https://d1die33kgxnq4e.cloudfront.net/uploads/map/overlay/
            // $t - tile_0_0.jpg
            // "map": "d1d/4f138275e5419b8788927a36/$t",

            if (source === 'livelox') return map;

            return map.replace('d1d', 'https://d1die33kgxnq4e.cloudfront.net/uploads/map/overlay')
                      .replace('$t', 'tile_0_0.jpg');
        }

        const map = getMap(mark.map);

        return <CircleMarker center={[mark.lat, mark.lon]} pathOptions={{color: color, fillOpacity: 1}} radius={2.5}>

            <Popup className="popup">
                <div className="popup-content">
                    <button onClick={() => open(map)}>Open Map</button>
                    <img src={map} alt={mark.name} onClick={() => open(map)}/>
                </div>
            </Popup>
        </CircleMarker>
    }


    function MapsMarkers() {
        const [bounds, setBounds] = useState<LatLngBounds | null>(null);

        const map = useMapEvents({
            moveend: () => {
                const zoom = map.getZoom();
                if (zoom < 6) return setBounds(null);

                const bounds = map.getBounds();
                setBounds(bounds);
            }
        })

        if (bounds === null) return null;

        const myMarkers = getMarkersWithinBounds(allMarkers, bounds);
        const liveLoxMarkers = getMarkersWithinBounds(livelox, bounds);

        const myMarkers_ = myMarkers.map(x => Marker(x, 'loggator'));
        const liveLoxMarkers_ = liveLoxMarkers.map(x => Marker(x, 'livelox'));
        return myMarkers_.concat(liveLoxMarkers_);
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
        getLocation();
    }, []);

    if (center === null) return <span>Loading...</span>


    return <div className="App">
        <MapContainer center={center} zoom={9} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

            {/*// @ts-ignore*/}
            <MapsMarkers/>
        </MapContainer>
    </div>
}
