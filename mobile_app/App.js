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
import Landmarks from "./Src/Components/Landmarks"
import LandmarkButton from "./Src/Components/LandmarkButton"


import destinationMarker from "./images/markers/mapMarker.png"

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0022;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
var id = 0; LATITUDE_DELTA * ASPECT_RATIO

class App extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;

    this.state = {
      receivedPathCoords: [],
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
      },
      landmarkVeiw: false
    };
    this.handlePress = this.handlePress.bind(this);
  }

  //callback data from Destination.js component
  callbackCoordinates = (coordsToDestination) => {
    this.setState({ receivedPathCoords: coordsToDestination })
    console.log("child data", this.state.receivedPathCoords);
    this.onLayout();
  }

  //callback data from LandmarkButton.js component
  callBackButtonClick = (clickEvent) => {
    console.log("buttonProp", clickEvent);
    this.setState({ landmarkVeiw: clickEvent })
  }

  //user destination press on map
  handlePress(e) {
    console.log("handle press");
    this.setState({
      destinationMarker:
      {
        coordinate: e.nativeEvent.coordinate,
        key: ++id
      },
      landmarkVeiw: false
    });
  }

  componentDidMount() {
    const { coordinate } = this.state;
    console.log("componentdidmount start");

    //get the current position function
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
          console.log("marker point");
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
    console.log("componentwillunmount");
  }

  //map view region adjusting function
  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: this.state.latitudeDelta,
    longitudeDelta: this.state.latitudeDelta
  });

  //user movement distant calcuating function
  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  //region auto zoom function
  onLayout = () => { setTimeout(() => { 
    this.map.fitToCoordinates(this.state.receivedPathCoords,
      { edgePadding: { top: 500, right: 500, bottom: 500, left: 500 }, animated: true, }); 
    }, 2000); 
    console.log("onLayout function");}

  render() {
    console.log("APPJS render");
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          ref={map => { this.map = map }}
          provider={PROVIDER_GOOGLE}
          showUserLocation
          followUserLocation
          loadingEnabled
          region={(id > 0) ? null : this.getMapRegion()}
          onPress={this.handlePress}
        >
          <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} />
          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate}
          >
            {/* <Image source={require('./images/markers/mapMarker.png')} style={{ height: 35, width: 35 }} /> */}
            </Marker.Animated>
          {(id > 0)
            ? [<Marker.Animated
              key={this.state.destinationMarker.key}
              coordinate={this.state.destinationMarker.coordinate}
            >
              <Image source={require('./images/markers/mapMarker.png')} style={{ height: 35, width: 35 }} />
            </Marker.Animated>,
            <Destination
              pathCoordsCallback={this.callbackCoordinates}
              key={this.state.destinationMarker.key - 1}
              originLatitude={this.state.latitude}
              originLongitude={this.state.longitude}
              destinationLatitude={this.state.destinationMarker.coordinate.latitude}
              destinationLongitude={this.state.destinationMarker.coordinate.longitude}
            />]
            : null}
        </MapView>
        <LandmarkButton
          buttonClickProp={this.callBackButtonClick}
        />
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
        {(this.state.landmarkVeiw)
          ? <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.bubble, styles.button]}>
              <Text style={styles.bottomBarContent}>
                Lanmark mode on</Text>
            </TouchableOpacity>
          </View>
          :null}
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