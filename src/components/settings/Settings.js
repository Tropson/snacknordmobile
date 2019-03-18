import React, {Component} from 'react';
import {View,StatusBar,StyleSheet,Text,RefreshControl,ScrollView, TouchableOpacity, Image,BackHandler,ToastAndroid} from 'react-native';
import RF from "react-native-responsive-fontsize";
import { NavigationBar } from 'navigationbar-react-native';
type Props = {};
export default class Settings extends Component<Props> {
  constructor()
  {
    super();
    this.state={}
  }
  render(){
    return (
     <View style={styles.container}>
       <View style={this.state.deliveries>0?styles.middleContent:styles.middleSection}>
          {this.state.deliveries>0?
            <Text>{this.state.deliveries}</Text>
            :
            <View style={{alignItems: 'center',}}>
              <Text style={styles.noDeliveryText}>Settings</Text>
            </View>
        }
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
