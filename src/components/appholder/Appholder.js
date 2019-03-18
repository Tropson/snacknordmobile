import React, {Component} from 'react';
import {View,StatusBar,StyleSheet,Text,RefreshControl,ScrollView, TouchableOpacity, Image,BackHandler,ToastAndroid} from 'react-native';
import RF from "react-native-responsive-fontsize";
import firebase from "react-native-firebase";
const db = firebase.firestore();
import { NavigationBar } from 'navigationbar-react-native';
import Orders from '../orders/Orders';
import Settings from '../settings/Settings';
import Statistics from '../statistics/Statistics';
type Props = {};
const logo=require('../../images/menu/profile.png');
const data=require('../../images/menu/data.png');
const home=require('../../images/menu/home.png');
const settings=require('../../images/menu/settings.png');
var myOrders = <Orders/>;
var mySettings = <Settings/>;
var myStatistics = <Statistics/>;
const ComponentMiddle=()=>{
  return(
    <View style={{flex:1,alignItems: 'center'}}>
      <Text style={{fontSize:RF(4), color:'white',fontWeight: 'bold'}}>SnackNord</Text>
    </View>
  );
}
export default class Appholder extends Component<Props> {
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
      deliveries:1,
      appComponent:myOrders,
      active:'Orders',
    }
  }
  _onRefresh = () => {
  this.setState({refreshing: true});
  this.fetchData().then(() => {
    this.setState({deliveries: 1});
    this.setState({refreshing: false});
  });
}
  fetchData=()=>{
    return new Promise((resolve,reject)=>{
      setTimeout(()=>{resolve('Hi there')},100);
    });
  }
  render(){
    const {navigate} = this.props.navigation;
    return (
     <View style={styles.container}>
       <NavigationBar
         componentRight={()=><View style={{ flex: 1, alignItems: 'flex-end', marginRight:'3%'}}>
           <TouchableOpacity onPress={()=>{navigate('Profile',{})}} activeOpacity={0.7}>
             <Image source={logo} style={styles.profileLogo}></Image>
           </TouchableOpacity>
         </View>}
         componentCenter={()=><ComponentMiddle/>}
         navigationBarStyle= {{ elevation:5, backgroundColor: '#8ad3e6'}}
        />
      <StatusBar barStyle='dark-content' backgroundColor='#8ad3e6' animated/>
        {this.state.appComponent}
        <View style={styles.navbarBottom}>
         <View style={styles.navbarIconsContainer}>
           <TouchableOpacity activeOpacity={0.7} onPress={()=>{this.setState({appComponent:myOrders,active:'Orders'})}}>
             <Image style={styles.navbarIcons} tintColor={this.state.active=='Orders'?'black':'white'} source={home}/>
           </TouchableOpacity>
           <TouchableOpacity activeOpacity={0.7} onPress={()=>{this.setState({appComponent:myStatistics,active:'Statistics'})}}>
             <Image style={styles.navbarIcons} tintColor={this.state.active=='Statistics'?'black':'white'} source={data}/>
           </TouchableOpacity>
           <TouchableOpacity activeOpacity={0.7} onPress={()=>{this.setState({appComponent:mySettings,active:'Settings'})}}>
             <Image style={styles.navbarIcons} tintColor={this.state.active=='Settings'?'black':'white'} source={settings}/>
           </TouchableOpacity>
         </View>
       </View>
     </View>
   );
  }
}
const styles = StyleSheet.create({
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
    backgroundColor: '#FAFAFA',
    flex:10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleContent:{
    backgroundColor: '#FAFAFA',
    flex:10,
    alignItems: 'center',
    paddingTop:'10%',
  },
  navbarBottom:{
    backgroundColor: '#8ad3e6',
    height:'10%',
    justifyContent: 'center',
    elevation: 5,
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
