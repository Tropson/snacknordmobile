import React, {Component} from 'react';
import {View,FlatList,StyleSheet,Text,Dimensions,AsyncStorage} from 'react-native';
import RF from "react-native-responsive-fontsize";
import firebase from "react-native-firebase";
const db = firebase.firestore();
import AnimateNumber from 'react-native-animate-number';
type Props = {};
const logo=require('../../images/menu/profile.png');
const data=require('../../images/menu/data.png');
const home=require('../../images/menu/home.png');
const settings=require('../../images/menu/settings.png');
export default class Statistics extends Component<Props> {
  static navigationOptions = {
      headerMode: 'none',
      navigationOptions: {
        headerVisible: false,
      }
  };
  getUser = ()=>{
    return new Promise(async (resolve,reject)=>{
      let uuid = await AsyncStorage.getItem('uid');
      let uemail = await AsyncStorage.getItem('email');
      this.setState({user:{uid:uuid,email:uemail}});
      resolve();
    })
  }
  constructor()
  {
    super();
    this.state={
      elementSize:0,
      hours:0,
      orders:0,
      distance:0,
      user:{},
    }
  }
  componentDidMount(){
    this.getUser().then(()=>{
      db.collection('History').where('postee_name','==',this.state.user.email).get().then((snap)=>{
        this.setState({orders:snap.size});
        var hours=0;
        snap.forEach(x=>{
          hours+=((x.data().end_time-x.data().order_date)/60)/60;
        })
        this.setState({hours:hours});
      });
    })
  }

  formatData = (data, numColumns) => {
    const numberOfFullRows = data.length%numColumns;
    let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
    while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
      data.push({ name:`blank-${numberOfElementsLastRow}`, value:0 ,empty: true });
      numberOfElementsLastRow++;
    }
    return data;
  };
  render(){
    var dataRow=[{name:'Hours',value:this.state.hours},{name:'Orders',value:this.state.orders},{name:'Distance',value:this.state.distance+'km'}];
    return (
     <View style={styles.container}>
       <View style={styles.statContainer}>
          <FlatList 
            data={this.formatData(dataRow, 2)}
            style={styles.cardContainer}
            numColumns={2}
            renderItem={
              ({item,index})=>{
                if (item.empty) {
                  return <View style={[styles.card, styles.cardInvisible]} />;
                }
                else return(
                  <View key={item.name} style={styles.card}>
                    <Text style={styles.cardText}>{item.name}</Text>
                    <Text style={styles.cardText}>
                      {item.name=="Distance"?item.value:<AnimateNumber value={item.value}
                        formatter={(val) => {
                          return parseFloat(val).toFixed(0)
                        }}
                        timing="easeOut"
                        interval={0.05}
                      />
                      }
                    </Text>
                  </View>
                )
              }
            }
            keyExtractor={(item, index) => index.toString()}
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
  statContainer:{
    flex:8,
    backgroundColor:"#65C9E1",
    flexDirection:'row',
    padding:20
  },
  cardContainer:{
    flex:1,
  },
  card:{
    backgroundColor:'white',
    flex:1,
    height:(Dimensions.get('window').width-100)/2,
    borderRadius:15,
    margin:10,
    padding:20,
    elevation:5,
  },
  cardInvisible:{
    backgroundColor:'transparent',
    elevation:0,
  },
  cardText:{
    color:"#65C9E1",
    fontSize:RF(4),
    fontWeight:'bold',
  }
});
