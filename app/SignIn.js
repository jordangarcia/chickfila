import React from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { AuthSession, Linking } from 'expo'
import { BASE_URL } from './constants';
import * as WebBrowser from 'expo-web-browser'

export class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Please sign in',
  }

  constructor(props) {
    super(props)
    this.state = {
      authResult: {},
    }
  }

  render() {
    if (this.state.authResult.type && this.state.authResult.type === 'success') {
      return (
        <View>
          <Text>{`Hey there, user!`}</Text>
        </View>
      )
    } else {
      return (
        <View>
          <Button title="Login with Facebook" onPress={() => this.handleOAuthLogin()} />
        </View>
      )
    }
  }

  handleRedirect = async event => {
    WebBrowser.dismissBrowser()
  }

  async handleOAuthLogin() {
    // gets the app's deep link
    let redirectUrl = await Linking.getInitialURL()
    // this should change depending on where the server is running
    let authUrl = `${BASE_URL}/auth/facebook`
    Linking.addEventListener('url', this.handleRedirect)
    try {
      let authResult = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl,
      )
      await this.setState({ authResult: authResult })

    } catch (err) {
      console.log('ERROR:', err)
    }
    Linking.removeEventListener('url', this.handleRedirect)
  }
}
