import React, {Component} from 'react';
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';
var geolib = require('geolib');
import MapViewDirections from 'react-native-maps-directions';
import RF from "react-native-responsive-fontsize";
import {AsyncStorage,Alert,View,StatusBar,StyleSheet,Image,TouchableOpacity,Text} from 'react-native';
const mapStyle=require('./Style.json');
type Props = {};
const marker=require('../../images/map_circle_blue.png');
export default class Map extends Component<Props> {
  constructor(){
    super();
    this.state={
      posteeLocation:{coords:{longitude:0,latitude:0}},
      restaurantLocation:{coords:{longitude:0,latitude:0}},
      userLocation:{coords:{longitude:0,latitude:0}},
      restaurantName:'',
      userName:'',
      timeLeft:'',
      preparation_time:0,
      distance:0,
      distanceTime:0,
    }
  }
  componentDidMount(){
    this.getSavedDelivery().then(x=>{
      this.setState({restaurantLocation:{coords:{longitude:x.restaurant_geo._longitude,latitude:x.restaurant_geo._latitude}}});
      this.setState({preparation_time:x.preparation_time});
      this.setState({restaurant_name:x.restaurant_name});
    })
    this.getUserLocation().then(y=>{
      this.getPosteeDistance(this.state.restaurantLocation.coords,y).then(x=>this.setState({distance:x}));
      this.setState({posteeLocation:y});
    }).catch(error=>console.log(error));
    this.watchLocation();
    this.startTimer();
  }
  getSavedDelivery=()=>{
    return(new Promise(async (resolve,reject)=>{
      var delivery = await AsyncStorage.getItem('delivery');
      var deliveryObj=JSON.parse(delivery);
      resolve(deliveryObj);
    }));
  }
  startTimer=()=>{
    setInterval(()=>{
      var timeLeft=this.state.preparation_time - Math.floor(Date.now() / 1000);
      var hours = Math.floor(timeLeft / 3600);
      timeLeft = timeLeft - hours * 3600;
      var minutes = Math.floor(timeLeft / 60);
      var seconds = Math.floor(timeLeft - minutes * 60);
      var formatted = hours>0?`${hours>9?hours:`0${hours}`}:${minutes>9?minutes:`0${minutes}`}:${seconds>9?seconds:`0${seconds}`}`:`${minutes>9?minutes:`0${minutes}`}:${seconds>9?seconds:`0${seconds}`}`;
      this.setState({timeLeft:formatted});
    },1000);
  }
  getUserLocation = ()=>{
    return new Promise((resolve,reject)=>{
      navigator.geolocation.getCurrentPosition(position=>{
        resolve(position);
        console.log(position);
      },error=>reject(error.message)),{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    })
  }
  watchLocation=()=>{
    navigator.geolocation.watchPosition(position=>{
      this.setState({posteeLocation:position});
    },error=>{console.log(error.message)}),{enableHighAccuracy:true,timeout:20000,maximumAge:1000}
  }
  deleteOrder=async ()=>{
    let result = await AsyncStorage.removeItem('delivery');
    this.props.navigation.navigate('AuthLoading');
    return result;
  }
  getPosteeDistance = (restaurantCoords,userCoords)=>{
    return new Promise((resolve,reject)=>{
      console.log(userCoords.coords);
      console.log(geolib.getDistance(userCoords.coords,restaurantCoords));
      resolve(geolib.getDistance(userCoords.coords,restaurantCoords));
    })
  }
  render(){
    return(
      <View style={styles.container}>
        <StatusBar translucent barStyle='dark-content' backgroundColor="rgba(0, 0, 0, 0.0)" animated />
        <MapView
          style={styles.map}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          followsUserLocation={true}
          provider={"google"}
          initialRegion={{
            latitude: this.state.posteeLocation.coords.latitude,
            longitude: this.state.posteeLocation.coords.longitude,
            latitudeDelta: 0.150,
            longitudeDelta: 0.0421,
          }}>
            {/*<MapView.Marker coordinate={{latitude: this.state.posteeLocation.coords.latitude,longitude: this.state.posteeLocation.coords.longitude,}} title='You'/>*/}
            <MapView.Marker image={require('../../images/map_circle_blue.png')} coordinate={{latitude: this.state.restaurantLocation.coords.latitude,longitude: this.state.restaurantLocation.coords.longitude,}} title='Restaurant'/>
            <MapViewDirections
                origin={{latitude:this.state.posteeLocation.coords.latitude,longitude:this.state.posteeLocation.coords.longitude}}
                destination={{latitude:this.state.restaurantLocation.coords.latitude,longitude:this.state.restaurantLocation.coords.longitude}}
                apikey="AIzaSyBSNeoxs7H2RJ67t7jL7ZbgxV_FCE7hrH8"
                strokeWidth={5}
                strokeColor="#8ad3e6"
                method="bycycling"
                />
          </MapView>
          <View style={styles.controlContainer}>
            <View style={styles.top}>
              <TouchableOpacity activeOpacity={0.8} style={styles.mapButton} key='label'>
                <Text style={styles.mapButtonText}>Time left: {this.state.timeLeft}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.placeholder}></View>
            <View style={styles.bottom}>
              <View style={styles.box}>
                <View style={styles.bottomDescriptionContainer}>
                  <View style={styles.bottomRestaurantName}>
                    <Text style={styles.bottomRestaurantText}>{this.state.restaurant_name}</Text>
                  </View>
                  <View style={styles.bottomTextContainer}>
                    <Text style={styles.bottomText}>Distance: {this.state.distance/1000}km</Text>
                    <Text style={styles.bottomText}>Time</Text>
                  </View>
                </View>
                <View style={styles.bottomButtonContainer}>
                  <TouchableOpacity onPress={()=>{this.deleteOrder()}} activeOpacity={0.95} style={styles.mapButtonBottom} key='label'>
                    <Text style={styles.mapButtonTextBottom}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  box:{
    height:'100%',
    backgroundColor:'white',
    elevation:4,
    width:'100%',
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  bottomDescriptionContainer:{
    flex:2,
    backgroundColor:'white',
    width:'100%'
  },
  bottomButtonContainer:{
    flex:1,
    backgroundColor:'white',
    width:'100%',
    justifyContent:'center',
    alignItems:'center',
  },
  bottomRestaurantName:{
    width:'100%',
    flex:2,
    backgroundColor:'#8ad3e6',
    justifyContent:'center',
    alignItems:'center',
  },
  bottomRestaurantText:{
    fontSize:RF(4),
    color:'white',
    fontWeight:'bold',
  },
  bottomTextContainer:{
    flex:3,
    width:'100%',
    backgroundColor:'white',
    justifyContent:'center',
    alignItems:'center',
  },
  bottomText:{
    color:'black',
    fontWeight:'bold',
    fontSize:RF(3.5),
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlContainer:{
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    height:'100%',
    width:'100%',
    flex:1
  },
  top:{
    flex:2,
    justifyContent:'center',
    alignItems:'center',
    marginTop: '10%',
  },
  bottom:{
    flex:3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'white',
  },
  placeholder:{
    flex:8
  },
  mapButton:{
    height:60,
    width:'70%',
    borderRadius: 10,
    backgroundColor:'white',
    justifyContent:'center',
    alignItems:'center',
    elevation:5,
  },
  mapButtonBottom:{
    height:40,
    width:'30%',
    borderRadius: 10,
    backgroundColor:'#8ad3e6',
    justifyContent:'center',
    alignItems:'center',
    elevation:5,
  },
  mapButtonText:{
    fontSize:20,
    color:'#8ad3e6',
    fontWeight:'bold'
  },
  mapButtonTextBottom:{
    fontSize:20,
    color:'white',
    fontWeight:'bold'
  }
});
