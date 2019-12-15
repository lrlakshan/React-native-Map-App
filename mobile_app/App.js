import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
  PermissionsAndroid
} from "react-native";
import MapView, {
  Marker,
  AnimatedRegion,
  Polyline,
  PROVIDER_GOOGLE
} from "react-native-maps";
import haversine from "haversine";
import Geolocation from "react-native-geolocation-service"
import Destination from "./Src/Components/Destination"

import destinationMarker from "./images/markers/mapMarker.png"

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0022;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
var id = 0;LATITUDE_DELTA * ASPECT_RATIO

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }),
      destinationMarker: {
        coordinate: {
          latitude: 6.8482321,
          longitude: 79.953570,
        },
        key: id
      } 
    };
    this.handlePress = this.handlePress.bind(this);
  }

  handlePress(e) {
    this.setState({
      destinationMarker:
      {
        coordinate: e.nativeEvent.coordinate,
        key: ++id
      },
    });
    console.log("desLat", this.state.destinationMarker.coordinate.latitude)
    console.log("desLon", this.state.destinationMarker.coordinate.longitude)
  }

  componentDidMount() {
    const { coordinate } = this.state;

    this.watchID = Geolocation.watchPosition(
      position => {
        const { routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude } = position.coords;

        const newCoordinate = {
          latitude,
          longitude
        };

        if (Platform.OS === "android") {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate,
              100
            );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate
        });
        console.log("oriLat", latitude)
        console.log("oriLon", longitude)
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10
      }
    );
    
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watchID);
  }

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: this.state.latitudeDelta,
    longitudeDelta: this.state.latitudeDelta
  });

  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showUserLocation
          followUserLocation
          loadingEnabled
          region={this.getMapRegion()}
          onPress = {this.handlePress}
          fitToElements ={true}
          // onRegionChange={region => {
          //   clearTimeout(this.timerForMap)
          //   this.timerForMap = setTimeout(() => {
          //     this.showMarkers(region)
          //   }, 100)
          // }}
          
        >
          <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} />
          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate}
          />
          {(id>0) 
            ? [<Marker.Animated
              key={this.state.destinationMarker.key}
              coordinate={this.state.destinationMarker.coordinate}
            >
              {/* <View style={styles.marker}>
              <Text style={styles.text}>
                {JSON.stringify(this.state.markers.coordinate)}</Text>
            </View> */}
              <Image source={require('./images/markers/mapMarker.png')} style={{ height: 35, width: 35 }} />
            </Marker.Animated>,
            <Destination
              key={this.state.destinationMarker.key-1}
              originLatitude={this.state.latitude}
              originLongitude={this.state.longitude}
              destinationLatitude={this.state.destinationMarker.coordinate.latitude}
              destinationLongitude={this.state.destinationMarker.coordinate.longitude}
            />]
            : null}
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={styles.bottomBarContent}>
              {JSON.stringify(this.state.coordinate)}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={styles.bottomBarContent}>
              {JSON.stringify(this.state.routeCoordinates)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={styles.bottomBarContent}>
              {JSON.stringify(this.state.destinationMarker.coordinate)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  marker: {
    backgroundColor: "#550bbc",
    padding: 5,
    borderRadius: 5
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 1,
    backgroundColor: "transparent"
  }
});

export default App;