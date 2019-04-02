import React, {Component} from 'react';
import {AsyncStorage,Alert,View,StatusBar,StyleSheet,Text,RefreshControl,ScrollView, TouchableOpacity, Image,BackHandler,ToastAndroid,NetInfo,ActivityIndicator} from 'react-native';
import RF from "react-native-responsive-fontsize";
import firebase from "react-native-firebase";
var geolib = require('geolib');
const db = firebase.firestore();
import { NavigationBar } from 'navigationbar-react-native';
import { withNavigation } from 'react-navigation';
type Props = {};
const logo=require('../../images/menu/profile.png');
const data=require('../../images/menu/data.png');
const home=require('../../images/menu/home.png');
const settings=require('../../images/menu/settings.png');
const warning=require('../../images/warning.png');
const orderImage=require('../../images/order.png');
var counter=0;
var orders=[];
var savedNetwork='';
const ComponentMiddle=()=>{
  return(
    <View style={{flex:1,alignItems: 'center'}}>
      <Text style={{fontSize:RF(4), color:'white',fontWeight: 'bold'}}>SnackNord</Text>
    </View>
  );
}
class Orders extends Component<Props> {
  static navigationOptions = {
      headerMode: 'none',
      navigationOptions: {
        headerVisible: false,
      }
  };
  constructor()
  {
    super();
    this.state={
      refreshing: false,
      deliveries:'unloaded',
      network:'',
    }
  }
  componentDidMount(){
    if(orders.length==0)
    {
      this.fetchData().then(x=>{
        if(x==0)
        {
          this.setState({deliveries:x});
        }
        else {
          this.setState({deliveries:x});
          orders=x;
        }
      }).catch(x=>{
        this.setState({deliveries:'unloaded'});
      });
    }
    else
    {
      this.setState({network:savedNetwork})
      this.setState({deliveries:orders});
    }
  }
  renderNoInternet()
  {
    if(this.state.network=='unknown' || this.state.network=='none')
    {
      return(<View style={styles.noNetwork}>
        <Image source={warning} style={styles.noNetworkImage}/>
        <Text style={styles.noNetworkText}>There is no internet connection.</Text>
        <Text style={styles.noNetworkSubText}>This application needs an active internet connection.</Text>
        <Text style={styles.noNetworkSubText}>Please turn on mobile data or WiFi.</Text>
      </View>);
    }
    else return null;
  }
  getPosteeDistance = (restaurantCoords)=>{
    return new Promise((resolve,reject)=>{
      navigator.geolocation.getCurrentPosition(position=>{
        var userCoords = position.coords;
        console.log(`User: ${JSON.stringify(userCoords)}`);
        console.log(`Restaurant: ${JSON.stringify(restaurantCoords)}`);
        resolve(geolib.getDistance(userCoords,restaurantCoords));
      },error=>reject(error.message)),{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    })
  }
  checkNetwork=()=>
  {
    return new Promise((resolve,reject)=>{
      NetInfo.getConnectionInfo().then(con=>{
        if(con.type!='none' && con.type!='unknown')
        {
          this.setState({network:con.type});
          savedNetwork=con.type;
          resolve();
        }
        else{
          this.setState({network:con.type});
          savedNetwork=con.type;
          reject();
        }
      }).catch(err=>{
        console.log(err);
      })
    })
  }
  _onRefresh = () => {
    this.setState({refreshing: true});
    this.fetchData().then((x) => {
      if(x==0)
      {
        this.setState({deliveries:x});
        this.setState({refreshing: false});
      }
      else {
        this.setState({deliveries:x});
        this.setState({refreshing: false});
        orders=x;
      }
    }).catch(x=>{
      this.setState({deliveries:'unloaded'});
      this.setState({refreshing: false});
    });
  }
  checkOnAccept=()=>{
    this.checkNetwork().then(x=>{
      return true;
    }).catch(x=>{
      return false;
    })
  }
  addOrderToActives=(id)=>{
    return new Promise(async (resolve,reject)=>{
      db.collection('Orders').doc(id).get().then(async (snap)=>{
        await AsyncStorage.setItem('delivery', JSON.stringify(snap.data()));
        resolve(snap.id);
      })
    })
  }
  takeOrder=(id)=>{
    return new Promise(async (resolve,reject)=>{
      var posteeMail=await AsyncStorage.getItem('email');
      db.collection('Orders').doc(id).update(
        {postee_name:posteeMail}
      ).then(()=>{this.addOrderToActives(id).then((resolvedId)=>{if(id==resolvedId){this._onRefresh();resolve()}})}).catch(()=>{reject()})
    });
  }
  fetchData=()=>{
      return new Promise((resolve,reject)=>{
        this.checkNetwork().then(()=>{
          let docs=[];
          db.collection('Orders').get().then(snapShot=>{
            var counter=snapShot.size;
            if(snapShot.size==0)
            {
              resolve(0);
            }
            snapShot.forEach(x=>{
              console.log(x.data());
              this.getPosteeDistance({longitude:x.data().restaurant_geo.longitude,latitude:x.data().restaurant_geo.latitude}).then(distance=>{
                console.log('Distance: ' + distance);
                if(x.data().postee_name=='null' && distance<=6000)
                {
                  docs.push(x.data());
                }
                counter--;
                if(counter==0)
                {
                  if(docs.length==0)
                  {
                    resolve(0);
                  }
                  resolve(docs);
                }
              }).catch(err=>{console.log(err)});
            })
          })
        }).catch((x)=>{
          reject();
        });
    })
  }
  render(){
    const {navigate} = this.props.navigation;
    return (
     <View style={styles.container}>
       <ScrollView refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        } contentContainerStyle={this.state.network=='' || this.state.network=='unknown' || this.state.network=='none'?{height:'100%'}:this.state.deliveries==0||this.state.deliveries=='unloaded'?{height:'100%'}:{}}>
        {this.state.network=='' || this.state.network=='unknown' || this.state.network=='none'?null:
        <ScrollView scrollEventThrottle={16} contentContainerStyle={this.state.deliveries!==0&&this.state.deliveries!=='unloaded'?styles.middleContent:styles.middleSection}>
          {this.state.deliveries!==0&&this.state.deliveries!=='unloaded'?
            this.state.deliveries.map(x=>{
              var text = `${x.order_id}\n${x.restaurant_name}`;
              return (
                <TouchableOpacity onPress={()=>{Alert.alert('Taking an order','Are you sure you want to take order "' + x.order_id + '"?',[{text: 'Nah',onPress: () => {},style: 'cancel'},{text:'Yeah!',onPress:()=>{this.takeOrder(x.order_id).then(()=>{navigate('AuthLoader')})},style:'ok'}])}} activeOpacity={0.9} key={`box${x.order_id}`} style={styles.deliveryBox}>
                  <View style={{flex:1,height: '100%',alignItems: 'center',justifyContent: 'center'}}>
                    <Image source={orderImage} style={{width: '130%', resizeMode:'contain'}}/>
                  </View>
                  <View style={{flex:3,height: '100%',alignItems: 'flex-start',justifyContent: 'center'}}>
                      <Text key={`text${x.order_id}`} style={styles.deliveryText}>{text}</Text>
                  </View>
                </TouchableOpacity>
              )
            })
            :
            this.state.deliveries==0?
            <View style={{alignItems: 'center',}}>
              <Text style={styles.noDeliveryText}>No orders found</Text>
              <Text style={styles.noDeliverySubText}>Refresh to check nearby orders.</Text>
            </View>:<ActivityIndicator />

        }
        </ScrollView>}
        {this.renderNoInternet()}
        </ScrollView>
     </View>
   );
  }
}
const styles = StyleSheet.create({
  deliveryText:{
    color:'white',
    fontWeight: 'bold',
    fontSize: RF(4),
  },
  deliveryBox:{
    width:'85%',
    height:100,
    backgroundColor:'#8ad3e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    elevation: 1,
  },
  noNetwork:{
    height:'100%',
    width:'100%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNetworkText:{
    fontSize: RF(3.5),
    fontWeight: 'bold',
    color:'white',
  },
  noNetworkSubText:{
    fontSize: RF(2.5),
    color:'white',
  },
  noNetworkImage:{
    height:'7%',
    resizeMode: 'contain',
    marginBottom:5,
  },
  container:{
    flex:1,
    height: '100%',
    width: '100%',
  },
  topContainer:{
    flex:1,
    backgroundColor: 'green',
  },
  middleContainer:{
    flex:8,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer:{
    flex:1,
    backgroundColor: 'purple'
  },
  noDeliveryText:{
    fontSize:RF(4.5),
    color:'#666666',
    fontWeight:'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDeliverySubText:{
    fontSize:RF(2.5),
    color:'#666666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleSection:{
    backgroundColor: 'white',
    flex:10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleContent:{
    backgroundColor: 'white',
    flex:10,
    alignItems: 'center',
    paddingTop: 20,
  },
  navbarBottom:{
    backgroundColor: '#8ad3e6',
    height:'10%',
    justifyContent: 'center',
  },
  navbarIconsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navbarIcons:{
    height:'70%',
    resizeMode: 'contain'
  },
  profileLogo:{
    width:40,
    resizeMode: 'contain'
  },
});
export default withNavigation(Orders);
