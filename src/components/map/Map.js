import React, {Component} from 'react';
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';
import {Alert,View,StatusBar,StyleSheet,Image,TouchableOpacity,Text} from 'react-native';
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
    }
  }
  componentDidMount(){
    const { navigation } = this.props;
    this.getUserLocation().then(x=>{
      this.setState({posteeLocation:x});
    }).catch(error=>console.log(error));
    this.setState({restaurantLocation:{coords:{longitude:navigation.getParam('restaurant_geo').longitude,latitude:navigation.getParam('restaurant_geo').latitude}}});
  }
  getUserLocation = ()=>{
    return new Promise((resolve,reject)=>{
      navigator.geolocation.getCurrentPosition(position=>{
        resolve(position);
        console.log(position);
      },error=>reject(error.message)),{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    })
  }
  render(){
    console.log(this.state.posteeLocation);
    return(
      <View style={styles.container}>
        <StatusBar translucent barStyle='dark-content' backgroundColor="rgba(0, 0, 0, 0.0)" animated />
        <MapView
          style={styles.map}
          customMapStyle={mapStyle}
          initialRegion={{
            latitude: this.state.posteeLocation.coords.latitude,
            longitude: this.state.posteeLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
            <MapView.Marker coordinate={{latitude: this.state.posteeLocation.coords.latitude,longitude: this.state.posteeLocation.coords.longitude,}} title='A'/>
            <MapView.Marker icon={<Image source={require('../../images/map_circle_blue.png')} style={{height:30,resizeMode:'contain'}}/>} coordinate={{latitude: this.state.restaurantLocation.coords.latitude,longitude: this.state.restaurantLocation.coords.longitude,}} title='B'/>
          </MapView>
          <View style={styles.controlContainer}>
            <View style={styles.controlButton}>
              <TouchableOpacity style={styles.testButton} key='label'>
                <Text style={styles.testText}>And it works</Text>
              </TouchableOpacity>
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
  controlButton:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  testButton:{
    height:30,
    width:150,
    backgroundColor:'blue',
    justifyContent:'center',
    alignItems:'center'
  },
  testText:{
    fontSize:20,
    color:'white',
    fontWeight:'bold'
  }
});
