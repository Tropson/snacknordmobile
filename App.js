/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {createStackNavigator, createAppContainer,createSwitchNavigator} from 'react-navigation';
import { fromRight,fromLeft, zoomIn, zoomOut } from 'react-navigation-transitions'
import Login from './src/components/login/Login';
import Orders from './src/components/orders/Orders';
import Profile from './src/components/profile/Profile';
import Settings from './src/components/settings/Settings';
import Statistics from './src/components/statistics/Statistics';
import Appholder from './src/components/appholder/Appholder';
import AuthLoader from './src/components/login/AuthLoader';
import Map from './src/components/map/Map';
const handleCustomTransition = ({ scenes }) => {
  const prevScene = scenes[scenes.length - 2];
  const nextScene = scenes[scenes.length - 1];
  // Custom transitions go there
  if (prevScene
    && prevScene.route.routeName === 'Orders'
    && (nextScene.route.routeName === 'Statistics' || nextScene.route.routeName==='Settings')) {
    return fromRight();
  }
  else if(prevScene
  && prevScene.route.routeName==='Statistics'
  && nextScene.route.routeName==='Settings') {
    return fromRight();
  }
  else if (prevScene
    && prevScene.route.routeName === 'Settings'
    && nextScene.route.routeName === 'Statistics') {
    return fromLeft();
  }
  return null;
}
const AppStack = createStackNavigator({
    Appholder: {screen:Appholder},
    Profile: {screen:Profile},
},
{
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  },
  transitionConfig: (nav) => handleCustomTransition(nav),
});
const AuthStack = createStackNavigator({
  Login:{screen:Login}
},
{
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  }
})
const MapStack = createStackNavigator({
  Map:{screen:Map},
},
{
  headerMode:'none',
  navigationOptions:{
    headerVisible:false,
  },
});
export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading:AuthLoader,
    App:AppStack,
    Auth:AuthStack,
    Map:MapStack,
  },
  {
    initialRouteName:'AuthLoading',
  }
))
// export default class App extends Component<Props> {
//   constructor()
//   {
//     super();
//     this.state={
//       activeView:'Login',
//     }
//   }
//   render() {
//     if(this.state.activeView=='Login')
//     {
//
//     }
//     else if(this.state.activeView=='Orders')
//     {
//       return (<Orders />)
//     }
//   }
// }
