import React, {Component} from 'react';
import MapView, { MapViewAnimated } from 'react-native-maps';
import {Marker} from 'react-native-maps';
var geolib = require('geolib');
import firebase from 'react-native-firebase';
var db = firebase.firestore();
import MapViewDirections from 'react-native-maps-directions';
import RNSwipeVerify from 'react-native-swipe-verify';
import RF from "react-native-responsive-fontsize";
import {AsyncStorage,Alert,View,StatusBar,StyleSheet,Image,TouchableOpacity,Text,Linking,Dimensions,Animated,AppState} from 'react-native';
const mapStyle=require('./Style.json');
type Props = {};
const { width } = Dimensions.get('window')
var timer=0;
const marker=require('../../images/map_circle_blue.png');
export default class Map extends Component<Props> {
  constructor(){
    super();
    this.state={
      posteeLocation:{coords:{longitude:0,latitude:0}},
      destination:{coords:{longitude:0,latitude:0}},
      userLocation:{coords:{longitude:0,latitude:0}},
      centerLocation:{coords:{longitude:0,latitude:0}},
      restaurantName:'',
      userName:'',
      timeLeft:'',
      preparation_time:0,
      distance:10000,
      distanceTime:0,
      orderId:'',
      restaurant_approved:false,
      swiped:false,
      delivered:false,
      bottomSize:{height:0,width:0,x:0,y:0},
      appState: AppState.currentState,
    }
  }
  componentDidMount(){
    this.getSavedDelivery().then(x=>{
      var userLocation={coords:{longitude:x.user_geo._longitude,latitude:x.user_geo._latitude}};
      this.setState({swiped:x.pickup_status})
      this.setState({userName:x.user_address})
      this.setState({userLocation:userLocation});
      this.setState({destination:x.pickup_status?userLocation:{coords:{longitude:x.restaurant_geo._longitude,latitude:x.restaurant_geo._latitude}}});
      this.setState({preparation_time:x.preparation_time});
      this.setState({restaurant_name:x.restaurant_name});
      this.setState({orderId:x.order_id});
      this.setState({restaurant_approved:x.restaurant_approved});
      this.getUserLocation().then(y=>{
        this.setState({posteeLocation:y});
        var centerLocation = {latitude:y.coords.latitude*1,longitude:y.coords.longitude*1};
        console.log(centerLocation);
        this.setState({centerLocation:{coords:centerLocation}});
      }).catch(error=>console.log(error));
    })
    this.startTimer();
    AppState.addEventListener('change', this.handleAppStateChange);
  }
  componentWillUnmount(){
    this.stopListening().then(()=>{});
    AppState.removeEventListener('change', this.handleAppStateChange);
    clearInterval(timer);
  }
  getSavedDelivery=()=>{
    return(new Promise(async (resolve,reject)=>{
      var delivery = await AsyncStorage.getItem('delivery');
      var deliveryObj=JSON.parse(delivery);
      db.collection('Orders').doc(deliveryObj.order_id).get().then(snap=>{
        this.startListening(snap.data().order_id).then(()=>{
          resolve(snap.data());
        })
      })
    }));
  }
  startListening=(id)=>{
    return new Promise((resolve,reject)=>{
      db.collection('Orders').doc(id).onSnapshot(snap=>{
        if(snap.exists)
        {
          this.setState({restaurant_approved:snap.data().restaurant_approved});
        }
        resolve();
      })
    })
  }
  stopListening=(id)=>{
    return new Promise((resolve,reject)=>{
      db.collection('Orders').doc(id).onSnapshot(()=>{});
    })
  }
  startTimer=()=>{
    timer=setInterval(()=>{
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
  deleteOrder=async ()=>{
    let result = await AsyncStorage.removeItem('delivery');
    this.props.navigation.navigate('AuthLoading');
    return result;
  }
  showDirections = ()=>{
    var latLng=this.state.destination.coords.latitude + '+' + this.state.destination.coords.longitude;
    Linking.openURL('google.navigation:q=' + latLng + '&mode=b');
  }
  animateRegion=(region)=>{
    this.map.animateToRegion(region,5000);
  }
  pickUp=()=>{
    db.collection('Orders').doc(this.state.orderId).update(
      {pickup_status:true}
    ).then(()=>{
      this.state.destination=this.state.userLocation;
      this.setState({swiped:true});
      this.swipeVerify3.reset();
    })
  }
  finishDelivery=()=>{
    var timeStamp = Math.floor(Date.now() / 1000);
    db.collection('Orders').doc(this.state.orderId).get().then(x=>{
      db.collection('Orders').doc(this.state.orderId).delete().then(()=>{
        var newDoc=x.data();
        console.log(newDoc);
        db.collection('History').doc(x.id).set(newDoc).then(()=>{
          db.collection('History').doc(x.id).update({end_time:timeStamp}).then(async ()=>{
            let result = await AsyncStorage.removeItem('delivery');
            this.props.navigation.navigate('AuthLoading');
          })
        })
      })
    })
  }
  changeMapMargin=(event)=>{
    console.log(this.map);
  }
  handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.getUserLocation().then(y=>{
        this.setState({posteeLocation:y});
        var centerLocation = {latitude:y.coords.latitude*1,longitude:y.coords.longitude*1};
        console.log(centerLocation);
        this.setState({centerLocation:{coords:centerLocation}});
      }).catch(error=>console.log(error));
    }
    this.setState({appState: nextAppState});
  };
  render(){
    return(
      <View style={styles.container}>
        <StatusBar translucent barStyle='dark-content' backgroundColor="rgba(0, 0, 0, 0.0)" animated />
        {this.state.destination.coords.longitude!=0&&this.state.centerLocation.coords.longitude!=0?
        <MapView
          ref={ref => { this.map = ref; }}
          style={[styles.map,{marginBottom:this.state.bottomSize.height}]}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          followsUserLocation={true}
          provider={"google"}
          initialRegion={{
            latitude: this.state.centerLocation.coords.latitude+0.007,
            longitude: this.state.centerLocation.coords.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.0421,
          }}
          onMapReady={()=>{
            console.log(this.state.centerLocation);
            this.animateRegion({
              latitude: this.state.centerLocation.coords.latitude+0.007,
              longitude: this.state.centerLocation.coords.longitude,
              latitudeDelta: 0.03,
              longitudeDelta: 0.0421,
            });
          }}>
            {/*<MapView.Marker coordinate={{latitude: this.state.posteeLocation.coords.latitude,longitude: this.state.posteeLocation.coords.longitude,}} title='You'/>*/}
            <MapView.Marker coordinate={this.state.destination.coords} title='Restaurant'/>
            <MapViewDirections
                origin={this.state.posteeLocation.coords}
                destination={this.state.destination.coords}
                apikey="AIzaSyBSNeoxs7H2RJ67t7jL7ZbgxV_FCE7hrH8"
                strokeWidth={5}
                strokeColor="#8ad3e6"
                method="bycycling"
                onReady={result=>{
                  this.setState({distance:result.distance,distanceTime:result.duration});
                }}
                />
          </MapView>:null}
          <View style={styles.controlContainer}>
            <View style={styles.top}>
              <TouchableOpacity activeOpacity={0.8} style={styles.mapButton} key='label'>
                <View style={{flex:1,height:'80%',justifyContent:'center',paddingLeft:'3%'}}>
                  <Text style={styles.mapButtonText}>Time left: {this.state.timeLeft}</Text>
                </View>
                <View style={{flex:1,height:'80%',justifyContent:'center',alignItems:'flex-end',paddingRight:'3%'}}>
                  <Text style={styles.mapButtonText}>Order: {this.state.orderId.length<=7?this.state.orderId:this.state.orderId.substr(0,7) + '...'}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.placeholder}></View>
            <View style={{flex:2,width:'100%',justifyContent:'flex-end',alignItems:'center'}}>
              {this.state.restaurant_approved&&!this.state.swiped?<View style={{minHeight:60,justifyContent:"flex-end",width:'70%'}}>
                <RNSwipeVerify
                  style={{elevation:5}}
                  ref={ref => this.swipeVerify2 = ref}
                  width={width-50}
                  buttonSize={50}
                  buttonColor="#8ad3e6"
                  backgroundColor={this.state.swiped?"#8ad3e6":"#fff"}
                  icon={<Image source={require('../../images/map_blue.png')} style={{tintColor:'white',width:30,resizeMode:'contain'}}></Image>}
                  textColor="#37474F"
                  borderRadius={30}
                  okButton={{ visible: true, duration: 400 }}
                  onVerified={() => {
                    this.setState({ swiped: true });
                    this.pickUp();
                  }}>
                  <Text style={{fontWeight:'bold',color:this.state.swiped?'white':'#8ad3e6',fontSize:RF(3)}}>{this.state.swiped?'Good job! :)':'Ready to pickup'}</Text>
                </RNSwipeVerify>
              </View>:this.state.swiped&&!this.state.delivered?<View style={{minHeight:60,justifyContent:"flex-end",width:'70%'}}>
                <RNSwipeVerify
                  style={{elevation:5}}
                  ref={ref => this.swipeVerify3 = ref}
                  width={width-50}
                  buttonSize={50}
                  buttonColor="white"
                  backgroundColor={this.state.swiped&&this.state.delivered?"#8ad3e6":"#8ad3e6"}
                  icon={<Image source={require('../../images/map_blue.png')} style={{width:30,resizeMode:'contain'}}></Image>}
                  textColor="#37474F"
                  borderRadius={30}
                  okButton={{ visible: true, duration: 400 }}
                  onVerified={() => {
                    this.setState({ delivered: true });
                    this.finishDelivery();
                  }}>
                  <Text style={{fontWeight:'bold',color:this.state.swiped&&this.state.delivered?'white':'white',fontSize:RF(3)}}>{this.state.swiped&&this.state.delivered?'Amazing! :O':'Finished delivery'}</Text>
                </RNSwipeVerify>
              </View>:null}
              </View>
            <View style={styles.bottom} onLayout={(event)=>{this.setState({bottomSize:event.nativeEvent.layout})}}>
              <View style={styles.box}>
                <View style={{flex:3,width:'100%'}}>
                  <View style={styles.bottomDescriptionContainer}>
                    <View style={styles.bottomRestaurantName}>
                      <Text style={styles.bottomRestaurantText}>{this.state.swiped?this.state.userName:this.state.restaurant_name}</Text>
                    </View>
                    <View style={styles.bottomTextContainer}>
                      <Text style={styles.bottomText}>Distance: {this.state.distance.toFixed(1)}km</Text>
                      <Text style={styles.bottomText}>Duration: {this.state.distanceTime.toFixed(0)} minutes</Text>
                    </View>
                  </View>
                  <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity onPress={()=>{this.showDirections()}} activeOpacity={0.95} style={styles.mapButtonBottom} key='label'>
                      <Text style={styles.mapButtonTextBottom}>Directions</Text>
                    </TouchableOpacity>
                  </View>
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
    flex:4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder:{
    flex:7
  },
  mapButton:{
    height:60,
    width:'70%',
    borderRadius: 10,
    backgroundColor:'white',
    justifyContent:'center',
    alignItems:'center',
    elevation:5,
    flexDirection:'row',
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
