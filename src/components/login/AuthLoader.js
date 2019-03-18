import React, {Component} from 'react';
import {AsyncStorage,View,ActivityIndicator,StatusBar,StyleSheet} from 'react-native';
export default class AuthLoader extends Component<Props> {
  constructor() {
    super();
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('uid');
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
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
