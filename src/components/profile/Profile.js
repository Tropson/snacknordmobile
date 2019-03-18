import React, {Component} from 'react';
import {AsyncStorage,View,StatusBar,StyleSheet,Text, TouchableOpacity, Image,BackHandler,ToastAndroid} from 'react-native';
import RF from "react-native-responsive-fontsize";
import { NavigationBar } from 'navigationbar-react-native';
type Props = {};
const logo=require('../../images/menu/profile.png');
const data=require('../../images/menu/data.png');
const home=require('../../images/menu/home.png');
const settings=require('../../images/menu/settings.png');
const back = require('../../images/menu/arrow.png');
export default class Profile extends Component<Props> {
  static navigationOptions = {
      headerMode: 'none',
      navigationOptions: {
        headerVisible: false,
      }
  };
  getUser = async ()=>{
    let uuid = await AsyncStorage.getItem('uid');
    let uemail = await AsyncStorage.getItem('email');
    this.setState({user:{uid:uuid,email:uemail}});
  }
  constructor()
  {
    super();
    this.state={
      user:{}
    }
    this.getUser();
  }
  logout=async ()=>{
    let result = await AsyncStorage.removeItem('uid');
    this.props.navigation.navigate('AuthLoading');
    return result;
  }
  render(){
    const {goBack} = this.props.navigation;
    return (
     <View style={styles.container}>
       <NavigationBar
         componentLeft={()=>
           <View style={{ flex: 1, alignItems: 'flex-start'}} >
            <TouchableOpacity onPress={()=>{goBack()}} style={ {justifyContent:'center', flexDirection: 'row'}}>
             <Image
               source={back}
               style={{ resizeMode: 'contain', width: 20, height: 20, alignSelf: 'center' }}
             />
             <Text style={{ color: 'white',fontSize:RF(3),fontWeight: 'bold'}}>SnackNord</Text>
           </TouchableOpacity>
         </View>
        }
         navigationBarStyle= {{ elevation:5, backgroundColor: '#8ad3e6'}}
        />
      <StatusBar barStyle='dark-content' backgroundColor='#8ad3e6' animated/>
       <View style={styles.middleContent}>
              <Text style={styles.usernameText}>{`${this.state.user.email}`}</Text>
              <Text style={styles.uidText}>{`${this.state.user.uid}`}</Text>
              <TouchableOpacity onPress={this.logout}style={styles.button}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
       </View>
     </View>
   );
  }
}
const styles = StyleSheet.create({
  button:{
    textAlign:'center',
    height:'10%',
    width:'40%',
    marginTop:20,
    backgroundColor:'#8ad3e6',
    borderRadius:10,
    justifyContent:'center',
    color:'white',
    fontSize:RF(4),
    elevation:5,
    fontWeight: 'bold',
  },
  buttonText:{
    alignItems: 'center',
    textAlign: 'center',
    justifyContent:'center',
    color:'white',
    fontSize:RF(4),
    fontWeight: 'bold',
  },
  container:{
    flex:1,
    height: '100%',
    width: '100%',
  },
  usernameText:{
    fontSize:RF(4.5),
    color:'#666666',
    fontWeight:'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uidText:{
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
    justifyContent: 'center',
    paddingTop:'10%',
  },
  profileLogo:{
    width:40,
    resizeMode: 'contain'
  },
});
