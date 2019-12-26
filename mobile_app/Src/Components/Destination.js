import React from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Platform,
    PermissionsAndroid
} from "react-native";
import MapView, {
    Marker,
    AnimatedRegion,
    Polyline,
    PROVIDER_GOOGLE
} from "react-native-maps";
import MapviewDirections from "react-native-maps"

const mode = 'driving'; // 'walking';
const origin = '6.8483641,79.9537685';
const destination = '6.8478286932489585,79.95384380221367';
const APIKEY = 'AIzaSyBGnTT2uj_Jj_p91WdJi__OiuRreC98hac';


//path drawing algorithm 
export function decode(t, e) {
    for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0,
        a = null, c = Math.pow(10, e || 5);
        u < t.length
        ;
    ) {

        a = null, h = 0, i = 0

        do
            a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5;
        while (a >= 32)

        n = 1 & i ? ~(i >> 1) : i >> 1, h = i = 0

        do
            a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5;
        while (a >= 32)

        o = 1 & i ? ~(i >> 1) : i >> 1, l += n, r += o,
            d.push([l / c, r / c])
    }
    return d.map(
        function (t) {
            return { latitude: t[0], longitude: t[1] }
        })
}

class Destination extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            coords: []
        };
    }

    componentDidMount() {
        this.getRout();
        console.log("Child componentdidmount");
    }

    //function to get the route from current location to user defined location
    getRout = () => {

        const { originLatitude, originLongitude, destinationLatitude, destinationLongitude } = this.props;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLatitude+","+originLongitude}&destination=${destinationLatitude+","+destinationLongitude}&key=${APIKEY}&mode=${mode}`;

        fetch(url)
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson.routes.length) {
                    console.log("fetch url");
                    this.sendData(decode(responseJson.routes[0].overview_polyline.points));
                    this.setState({
                        coords: decode(responseJson.routes[0].overview_polyline.points) 
                    });
                    console.log('haaa', decode(responseJson.routes[0].overview_polyline.points));
                } else {
                }
            }).catch(e => { console.warn(e) });
    }

    sendData = (pathCoords) => {
        this.props.pathCoordsCallback(pathCoords);
        console.log("send data");
    }


    render() {
        console.log("destinatinon render");
        return (
                <MapView.Polyline
                    coordinates={[
                        // { latitude: 6.849836, longitude: 79.952973 }, // optional
                        ...this.state.coords,
                        // { latitude: 6.845785, longitude: 79.952611 }, // optional
                    ]}
                    strokeWidth={4}
                />
        );
    }
}

export default Destination;