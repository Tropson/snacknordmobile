import React, {Component} from 'react';
import {AsyncStorage,View,ActivityIndicator,StatusBar,StyleSheet} from 'react-native';
import firebase from "react-native-firebase";
const db = firebase.firestore();
export default class AuthLoader extends Component<Props> {
  constructor() {
    super();
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('uid');
    const delivery = await AsyncStorage.getItem('delivery');
    if(userToken)
    {
      db.collection('Postees').doc(userToken).get().then(snap=>{
        if (doc.exists) {
          if(delivery)
          {
            this.props.navigation.navigate('Map');
          }
          else this.props.navigation.navigate('App');
        }
        else {
          this.props.navigation.navigate("Auth");
      }
      })
    }
    else this.props.navigation.navigate('Auth');
  };
  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle='dark-content' backgroundColor="#8ad3e6" animated />
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}
const styles=StyleSheet.create({
  container:{
    flex:1,
    height: '100%',
    width:'100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
})
