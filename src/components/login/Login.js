import React, {Component} from 'react';
import {AsyncStorage, ActivityIndicator,NetInfo,Platform, Button, StatusBar, Keyboard, TouchableWithoutFeedback, StyleSheet, TextInput, KeyboardAvoidingView, Text, View, ImageBackground, Image, TouchableOpacity} from 'react-native';
import RF from "react-native-responsive-fontsize";
type Props = {};
import firebase from "react-native-firebase";
const db = firebase.firestore();
const auth = firebase.auth();
import bgImage from '../../images/postee_app_back_intro.png';
import posteeLogo from '../../images/intro_logo.png';
import logo from '../../images/logo.png';
const warning=require('../../images/warning.png');
export default class Login extends Component<Props> {
  static navigationOptions = {
    headerVisible:false,
  };
  constructor()
  {AsyncStorage
    super();
    this.state={
      username:'',
      password:'',
      wrong:'none',
      network:'',
      loggingIn:false,
    }
  }
  componentDidMount()
  {
    this.checkNetwork();
    NetInfo.addEventListener('connectionChange',(con)=>{this.handleConnectionChange(con)});
  }
  handleConnectionChange(con)
  {
    this.setState({network:con.type});
    this.renderNoInternet();
  }
  checkNetwork()
  {
    NetInfo.getConnectionInfo().then(con=>{
      this.setState({network:con.type});
    }).catch(err=>{
      console.log(err);
    })
  }
  login=()=>{
    const {navigate} = this.props.navigation;
    this.setState({loggingIn:true});
    if(this.state.username.split(' ').join('')!='' && this.state.password.split(' ').join('')!='')
    {
      auth.signInWithEmailAndPassword(this.state.username,this.state.password).then((user)=>{
          console.log(user.user.uid);
          db.collection("Postees").doc(user.user.uid).get().then(async postee=>{
              if (postee.exists==false) {
                this.setState({loggingIn:false});
                this.setState({wrong:'flex'});
              }
              else{
                await AsyncStorage.multiSet([['uid',postee.data().uid],['email',postee.data().email],['activeOrders','[]']]);
                this.setState({loggingIn:true});
                navigate('Appholder',{uid:user.user.uid});
              }
          }).catch(error=>{this.setState({wrong:'flex'});this.setState({loggingIn:false});});
        }).catch(error=>{
        this.setState({loggingIn:false});
        this.setState({wrong:'flex'});

      })
    }
    else{
      this.setState({loggingIn:false});
      this.setState({wrong:'flex'});
    }
  }
  renderNoInternet()
  {
    if(this.state.network=='' || this.state.network=='unknown' || this.state.network=='none')
    {
      return(<View style={styles.noNetwork}>
        <Image source={warning} style={styles.noNetworkImage}/>
        <Text style={styles.noNetworkText}>There is no internet connection</Text>
        <Text style={styles.noNetworkSubText}>This application needs an active internet connection.</Text>
        <Text style={styles.noNetworkSubText}>Please turn on mobile data or WiFi.</Text>
      </View>);
    }
    else return null;
  }
  renderLoginLoading()
  {
    if(this.state.loggingIn)
    {
      return(<View style={styles.noNetwork}>
        <ActivityIndicator />
      </View>)
    }
    else return null;
  }
  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground source={bgImage} style={styles.backgroundContainer}>
        <StatusBar translucent barStyle='dark-content' backgroundColor="rgba(0, 0, 0, 0.0)" animated />
        <View style={styles.backgroundContainerTest}>
          <View style={styles.topContainer}>
            <TouchableWithoutFeedback style={styles.posteeLogoContainer} onPress={Keyboard.dismiss} accessible={false}>
              <Image source={posteeLogo} style={styles.posteeLogo}></Image>
            </TouchableWithoutFeedback>
          </View>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView keyboardVerticalOffset={1000} style={styles.middleContainer}>
              <Text style={[styles.incorrectText, {display:this.state.wrong}]}>Incorrect username or password</Text>
              <TextInput selectionColor="#8ad3e6" placeholder="Email" autoCorrect={false} keyboardType='email-address' autoCapitalize='none' style={styles.username} onChangeText={(text)=>this.setState({username:text})}></TextInput>
              <TextInput selectionColor="#8ad3e6" secureTextEntry={true} autoCapitalize='none' keyboardType='default' placeholder="Password" style={styles.username} onChangeText={(text)=>this.setState({password:text})}></TextInput>
              <TouchableOpacity onPress={this.login} activeOpacity={0.7} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
          <View style={styles.bottomContainer}>
            <Image source={logo} style={styles.logo}></Image>
          </View>
          {this.renderNoInternet()}
          {this.renderLoginLoading()}
        </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  noNetwork:{
    height: '100%',
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
  noNetworkImage:{
    height:'7%',
    resizeMode: 'contain',
    marginBottom:5,
  },
  noNetworkSubText:{
    fontSize: RF(2.5),
    color:'white',
  },
  reloadButton:{
    textAlign:'center',
    height:'10%',
    width:'60%',
    marginTop:30,
    backgroundColor:'#8ad3e6',
    borderRadius:10,
    justifyContent:'center',
    elevation:5,
  },
  backgroundContainerTest:{
    flex:1,
    width:'100%',
    height:'100%',
  },
  topContainer:{
    flex:2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  middleContainer:{
    flex:3,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop:'15%'
  },
  bottomContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  incorrectText:{
    color:'red',
    fontSize:RF(3),
    marginBottom:'2%',
  },
  buttonStyle:{
    height: 40,
    width: 500,
    marginTop:30,
    backgroundColor: 'red',
  },
  logo:{
    resizeMode: 'contain',
    flex:1,
    width:'25%',
  },
  posteeLogoContainer:{
    marginBottom:5,
    flex:1
  },
  posteeLogo:{
    width:'70%',
    resizeMode:'contain',
  },
  loginContainer:{
    alignItems: 'center',
    justifyContent:'flex-start',
  },
  backgroundContainer:{
    flex:1,
    width:'100%',
    height:'100%',
    justifyContent:'space-between',
    alignItems:'center',
  },
  username:{
    color:'black',
    fontSize:RF(4),
    borderRadius:10,
    height:'20%',
    backgroundColor:'white',
    shadowColor:'#555555',
    shadowOffset:{width:10,height:10},
    margin:'2%',
    width:'70%',
    textAlign:'center',
    elevation: 4
  },
  container: {
    flex: 3,
    marginTop:100,
    justifyContent:'space-between',
    alignItems: 'center',
    //backgroundColor:'#EFEFEF'
  },
  loginButton:{
    textAlign:'center',
    height:'20%',
    width:'60%',
    marginTop:50,
    backgroundColor:'#8ad3e6',
    borderRadius:10,
    justifyContent:'center',
    color:'white',
    fontSize:RF(4),
    elevation:5,
    fontWeight: 'bold',
  },
  loginButtonText:{
    alignItems: 'center',
    textAlign: 'center',
    justifyContent:'center',
    color:'white',
    fontSize:RF(4.5),
    fontWeight: 'bold',
  },
});
