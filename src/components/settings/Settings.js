import React, {Component} from 'react';
import {AsyncStorage,View,StatusBar,StyleSheet,Text,RefreshControl,ScrollView, TouchableOpacity, Image,BackHandler,ToastAndroid,FlatList} from 'react-native';
import RF from "react-native-responsive-fontsize";
import { NavigationBar } from 'navigationbar-react-native';
import firebase from "react-native-firebase";
const db = firebase.firestore();
type Props = {};
export default class Settings extends Component<Props> {
  constructor()
  {
    super();
    this.state={
      schedule:{},
      user:{},
    }
  }
  getUser = ()=>{
    return new Promise(async (resolve,reject)=>{
      let uuid = await AsyncStorage.getItem('uid');
      let uemail = await AsyncStorage.getItem('email');
      this.setState({user:{uid:uuid,email:uemail}});
      resolve();
    })
  }
  componentDidMount(){
    this.getUser().then(user=>{
      db.collection('Postees').doc(this.state.user.uid).collection('Schedule').doc('Recent').get().then(snap=>{
        console.log(snap.data())
      })
    })
  }
  render(){
    return (
     <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList data={[{name:'Monday'},{name:'Tuesday'},{name:'Wednesday'},{name:'Thursday'},{name:'Friday'},{name:'Saturday'},{name:'Sunday'}]}
          style={styles.cardContainer}
          contentContainerStyle={{paddingHorizontal:30,paddingVertical:30}}
          renderItem={
            ({item,index})=>{
              return(
                <TouchableOpacity activeOpacity={0.9} key={item.name} style={styles.card}>
                  <View style={{flex:1,height:'100%',justifyContent:'center',alignItems:'flex-start',paddingLeft:20}}>
                    <Text style={styles.cardText}>{item.name}</Text>
                    <Text style={styles.cardText}>15.20 - 16.20</Text>
                  </View>
                  <View style={{flex:1,height:'100%',justifyContent:'center',alignItems:'center'}}>
                    <Text style={styles.cardText}>None</Text>
                  </View>
                </TouchableOpacity>
              )
            }
          }
        />
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
  listContainer:{
    flex:8,
    backgroundColor:"#65C9E1",
    flexDirection:'row',
    alignItems:'center',
  },
  cardContainer:{
    flex:1,
  },
  card:{
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'white',
    height:100,
    width:'100%',
    marginBottom:10,
    borderRadius:10,
    elevation:4,
    flexDirection:'row',
  },
  cardText:{
    fontSize:RF(4),
    fontWeight:'bold',
  },
});
