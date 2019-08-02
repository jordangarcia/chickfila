import React, { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Button,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
} from 'react-native'
// import { Font } from 'expo'
import * as Font from 'expo-font'
import {
  createSwitchNavigator,
  createStackNavigator,
  createAppContainer,
} from 'react-navigation'
import { SignInScreen } from './SignIn'
import { COLORS, BASE_URL } from './constants'
import { TouchableOpacity, TextInput } from 'react-native-gesture-handler'

function MyButton({ children, onPress = () => {}, style = {} }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.whiteButton, style]}>
      {children}
    </TouchableOpacity>
  )
}

async function tryLogin(username, password) {
  const req = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    redirect: 'follow',
    body: JSON.stringify({ username, password }),
  })

  const resp = await req.json()
  if (resp.success) {
    AsyncStorage.setItem('login', JSON.stringify({ username, password }))
  }
  return resp
}

function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function register() {
    const req = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      redirect: 'follow',
      body: JSON.stringify({ username, password }),
    })

    const resp = await req.json()
    if (resp.success) {
      AsyncStorage.setItem('login', JSON.stringify({ username, password }))
      navigation.navigate('app')
    }
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.flexColumn,
        styles.flexCenter,
        styles.flexStretch,
        styles.container,
        { backgroundColor: COLORS.red },
      ]}
      behavior="padding"
    >
      <View>
        <Text style={[styles.colorWhite, styles.apercuBold, styles.fontHuge]}>
          Register
        </Text>
      </View>
      <TextInput
        style={[styles.formInput]}
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.formInput]}
        value={password}
        onChangeText={setPassword}
        placeholder="password"
        textContentType="password"
        autoCapitalize="none"
        secureTextEntry={true}
      />

      <MyButton onPress={() => register()} style={{ backgroundColor: '#5faec5' }}>
        <Text style={{ color: 'white', fontSize: 16 }}>Create Account</Text>
      </MyButton>
    </KeyboardAvoidingView>
  )
}

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  let msgOutput = null
  if (msg) {
    msgOutput = <Text style={{ color: 'white', fontSize: 16 }}>{msg}</Text>
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flexColumn, { backgroundColor: COLORS.red }]}
      behavior="padding"
    >
      <View
        style={[styles.flex1, styles.flexCenter, styles.flexStretch, styles.container]}
      >
        <View>
          <Text style={[styles.colorWhite, styles.apercuBold, styles.fontHuge]}>
            Sign In
          </Text>
        </View>
        <TextInput
          style={[styles.formInput]}
          value={username}
          onChangeText={setUsername}
          placeholder="username"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.formInput]}
          value={password}
          onChangeText={setPassword}
          placeholder="password"
          textContentType="password"
          autoCapitalize="none"
          secureTextEntry={true}
        />

        <MyButton
          onPress={async () => {
            setMsg('')
            const { success, error } = await tryLogin(username, password)
            if (success) {
              navigation.navigate('app')
            } else {
              setMsg(error)
              console.log(error)
            }
          }}
          style={{ backgroundColor: '#5faec5' }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Sign In</Text>
        </MyButton>
        {msgOutput}
      </View>
    </KeyboardAvoidingView>
  )
}

function SplashScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  function autoLogin() {
    try {
      AsyncStorage.getItem('login')
        .then(loginRaw => {
          const { username, password } = JSON.parse(loginRaw)
          return tryLogin(username, password)
        })
        .then(({ success }) => {
          if (success) {
            navigation.navigate('home')
          } else {
            setLoading(false)
          }
        })
    } catch (e) {
      setLoading(false)
    }
  }
  // useEffect(autoLogin, [])
  // setLoading(false)

  if (loading) {
    return <View style={[styles.flexColumn, { backgroundColor: COLORS.red }]} />
  }

  return (
    <View style={[styles.flexColumn, { backgroundColor: COLORS.red }]}>
      <View style={[styles.flex1, styles.flexCenter]}>
        <Text style={[styles.colorWhite, styles.apercuBold, styles.fontHuge]}>
          Welcome
        </Text>
      </View>
      <View
        style={[
          styles.flex1,
          styles.flexCenter,
          styles.flexStretch,
          { backgroundColor: COLORS.red, paddingHorizontal: 30 },
        ]}
      >
        <MyButton onPress={() => navigation.navigate('register')}>
          <Text style={{ fontSize: 16 }}>Register</Text>
        </MyButton>
        <MyButton onPress={() => navigation.navigate('login')}>
          <Text style={{ fontSize: 16 }}>Sign In</Text>
        </MyButton>
      </View>
    </View>
  )
}

function HomeScreen({ navigation }) {
  return (
    <View style={[styles.flexColumn, { backgroundColor: COLORS.red }]}>
      <View style={[styles.flex1, styles.flexCenter]}>
        <Text style={[styles.colorWhite, styles.apercuBold, styles.fontHuge]}>Home</Text>
      </View>
    </View>
  )
}

const AppStack = createStackNavigator({
  home: HomeScreen,
})

const AuthStack = createStackNavigator(
  {
    splash: SplashScreen,
    register: RegisterScreen,
    login: LoginScreen,
  },
  {
    initialRouteName: 'splash',
    headerMode: 'null',
  },
)

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      app: AppStack,
      auth: AuthStack,
    },
    {
      initialRouteName: 'auth',
    },
  ),
)

export default function App(props) {
  const [fontLoaded, setFontLoaded] = useState(false)
  useEffect(() => {
    Font.loadAsync({
      'apercu-regular': require('./assets/Apercu-Regular.ttf'),
      'apercu-bold': require('./assets/Apercu-Bold.ttf'),
    }).then(() => {
      setFontLoaded(true)
    })
  }, [])

  if (!fontLoaded) {
    return <View style={{ flex: 1, backgroundColor: COLORS.red }} />
  }

  return <AppContainer {...props} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  flexColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexStretch: {
    alignItems: 'stretch',
  },
  apercu: {
    fontFamily: 'apercu-regular',
  },
  apercuBold: {
    fontFamily: 'apercu-bold',
  },
  fontHuge: {
    fontSize: 30,
  },
  colorWhite: {
    color: '#fefefe',
  },
  container: {
    padding: 30,
  },
  whiteButton: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    backgroundColor: '#fefefe',
    borderRadius: 3,
    color: '#386682',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    // margin: 5,
    marginVertical: 10,
  },
  formInput: {
    backgroundColor: 'white',
    height: 40,
    fontSize: 24,
    paddingHorizontal: 5,
    marginVertical: 10,
    borderRadius: 3,
  },
})
