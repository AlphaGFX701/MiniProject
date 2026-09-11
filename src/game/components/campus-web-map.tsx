import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { CAMPUS_CENTER, ENCOUNTER_LIST } from "../data";
import facultyImages from "../faculty-map-images.json";
import encounterImages from "../encounter-map-images.json";
import images from "../player-map-images.json";
import type { Coordinate, EncounterId } from "../types";
export type CampusMapHandle = {
  animateCamera: (
    camera: { center: Coordinate; zoom?: number },
    options?: { duration: number },
  ) => void;
};
const HTML = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{margin:0;height:100%;background:#17283d}.leaflet-tile-pane{filter:invert(1) hue-rotate(170deg) saturate(.55) brightness(.8)}.leaflet-control-attribution{margin-bottom:245px!important;font-size:10px!important}.player{image-rendering:pixelated;width:64px;height:64px;filter:drop-shadow(0 3px 3px #000)}.pin{background:#142c43;border:3px solid #5be0cd;border-radius:24px;color:white;font:bold 15px sans-serif;text-align:center;line-height:36px}.leaflet-container{background:#17283d}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
const map=L.map('map',{zoomControl:false}).setView([${CAMPUS_CENTER.latitude},${CAMPUS_CENTER.longitude}],18);
map.attributionControl.setPosition('topright');
const attribution=map.attributionControl.getContainer();
attribution.style.setProperty('margin-bottom','0','important');
attribution.style.setProperty('margin-top','140px','important');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
const frames=${JSON.stringify(images)};
const player=L.marker(map.getCenter(),{icon:L.divIcon({className:'',html:'<img class="player" src="'+frames.down[0]+'">',iconSize:[64,64],iconAnchor:[32,48]}),zIndexOffset:1000}).addTo(map);
const circle=L.circle(map.getCenter(),{radius:40,color:'#65e9da',weight:2,fillOpacity:.06}).addTo(map);
const encounters=${JSON.stringify(ENCOUNTER_LIST)};
const pins=[];
const encounterImages=${JSON.stringify(encounterImages)};
function silhouette(i){return '<img alt="Unknown echo" width=36 height=36 style="filter:brightness(0) invert(1);opacity:.8;image-rendering:pixelated" src="'+encounterImages[i]+'">';}
map.on("click",()=>window.ReactNativeWebView.postMessage("dismiss"));
encounters.forEach((e,i)=>{const p=[e.coordinate.latitude,e.coordinate.longitude];pins.push(L.marker(p,{bubblingMouseEvents:false,icon:L.divIcon({className:'pin',html:['❄','◎','☾'][i],iconSize:[38,38]})}).addTo(map).on('click',()=>window.ReactNativeWebView.postMessage(e.id)));});
const facultyImages=${JSON.stringify(facultyImages)};
const trainers=encounters.map((e,i)=>L.marker([e.coordinate.latitude+.00016,e.coordinate.longitude+.00022],{bubblingMouseEvents:false,icon:L.divIcon({className:'pin',html:'<img width=36 height=36 src="'+facultyImages[i]+'">',iconSize:[38,38]})}).addTo(map).on('click',()=>window.ReactNativeWebView.postMessage('trainer:'+e.id)));
window.updateCompleted=function(ids){pins.forEach((p,i)=>{p.getElement().innerHTML=ids.includes(encounters[i].id)?'✓':silhouette(i);});};
window.updatePlayer=function(p,d,f){player.setLatLng([p.latitude,p.longitude]);circle.setLatLng([p.latitude,p.longitude]);const img=player.getElement().querySelector('img');if(img)img.src=frames[d][f];};
window.updateFaculty=function(unlocked){trainers.forEach((p,i)=>p.getElement().innerHTML='<img width=36 height=36 src="'+facultyImages[i]+'"><span style="position:absolute;right:-5px;top:-10px;font-size:12px">'+(unlocked?'!':'🔒')+'</span>');};
window.moveCamera=function(p,z){map.setView([p.latitude,p.longitude],z||map.getZoom(),{animate:false});};
window.ReactNativeWebView.postMessage('ready');
</script></body></html>`;
export const CampusWebMap = forwardRef<
  CampusMapHandle,
  {
    coordinate: Coordinate;
    direction: keyof typeof images;
    frame: number;
    onSelect: (id: EncounterId) => void;
    onDismiss: () => void;
    completedIds: EncounterId[];
    facultyUnlocked: boolean;
    onTrainer: (id: EncounterId) => void;
  }
>(function CampusWebMap(
  {
    coordinate,
    direction,
    frame,
    onSelect,
    onDismiss,
    completedIds,
    facultyUnlocked,
    onTrainer,
  },
  ref,
) {
  const web = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      animateCamera: ({ center, zoom }) =>
        web.current?.injectJavaScript(
          `window.moveCamera && window.moveCamera(${JSON.stringify(center)},${zoom ?? "undefined"});true;`,
        ),
    }),
    [],
  );
  useEffect(() => {
    if (ready)
      web.current?.injectJavaScript(
        `window.updatePlayer(${JSON.stringify(coordinate)},${JSON.stringify(direction)},${frame});true;`,
      );
  }, [coordinate, direction, frame, ready]);
  useEffect(() => {
    if (ready)
      web.current?.injectJavaScript(
        `window.updateCompleted(${JSON.stringify(completedIds)});window.updateFaculty(${facultyUnlocked});true;`,
      );
  }, [ready, completedIds, facultyUnlocked]);
  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        ref={web}
        source={{ html: HTML, baseUrl: "https://echo-hunt.local/" }}
        originWhitelist={["*"]}
        userAgent="EchoHuntClassroom/1.0 Android"
        javaScriptEnabled
        onError={() => setError(true)}
        onMessage={(e) => {
          const m = e.nativeEvent.data;
          if (m === "ready") setReady(true);
          else if (
            m.startsWith("trainer:") &&
            ENCOUNTER_LIST.some((x) => x.id === m.slice(8))
          )
            onTrainer(m.slice(8) as EncounterId);
          else if (m === "dismiss") onDismiss();
          else if (ENCOUNTER_LIST.some((x) => x.id === m))
            onSelect(m as EncounterId);
        }}
      />
      {!ready || error ? (
        <Text
          style={{
            position: "absolute",
            top: "40%",
            alignSelf: "center",
            color: "white",
            backgroundColor: "#17283d",
            padding: 12,
          }}
        >
          {error
            ? "Map connection failed. Check your internet."
            : "Loading campus map…"}
        </Text>
      ) : null}
    </View>
  );
});
