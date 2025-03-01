import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import Colors from '../../assets/colors/Colors';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Snackbar } from 'react-native-paper';

const DeleteAccount = () => {
  const navigation = useNavigation()
  const [snackBarText, setSnackBarText] = useState("")
  const [snackBarVisibility, setSnackBarVisibility] = useState(false)

  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);

  // Verification code (OTP - One-Time-Passcode)
  const [code, setCode] = useState('');

  const DeleteAccount = async () => {
    await confirm.confirm(code).then(async (response) => {
      try {
        await firestore().collection("Users").doc(auth().currentUser.uid).delete()
        await auth().currentUser.delete()
        navigation.replace('SelectCountry');
      }
      catch (error) {
        setSnackBarText("Please enter right code")
        setSnackBarVisibility(!snackBarVisibility)
      }
    }
    ).catch((error) => {
      console.log(error)
    })
  }

  const SendVerificationCode = async () => {
    const confirmation = await auth().signInWithPhoneNumber(auth().currentUser.phoneNumber);
    setConfirm(confirmation);
  }

  return (
    <View style={styles.container}>
      <View style={styles.AppBar}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigation.goBack()}>
          <View style={styles.iconButton}>
            <Icon name='arrow-back-ios' size={20} color={Colors.black} />
          </View>
        </TouchableOpacity>
        <Text style={styles.AppBarText}>
          Delete account
        </Text>
        <View style={styles.iconButton}>
          <Icon name='arrow-back-ios' size={20} color='transparent' />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          padding: 10,
          borderRadius: 5,
          marginHorizontal: 10,
        }}>
          Please note by confirming, your account will be permanently deletled and all data associated with it will be deleted.
        </Text>
        <TextInput style={styles.descriptionBox}
          placeholder='Type Verification code'
          value={code}
          onChangeText={text => setCode(text)}
        />
        <TouchableOpacity onPress={() => SendVerificationCode()}>
          <Text style={{
            padding: 10,
            borderRadius: 5,
            marginHorizontal: 10,
            alignSelf: 'center',
            textDecorationLine: 'underline',
            color: 'blue'
          }}>
            send verification code
          </Text>
        </TouchableOpacity>
      </View>
      <Snackbar
        elevation={10}
        duration={1200}
        visible={snackBarVisibility}
        wrapperStyle={{ marginBottom: 60 }}
        onDismiss={() => { setSnackBarVisibility(!snackBarVisibility) }}>
        {snackBarText}
      </Snackbar>
      <TouchableOpacity onPress={() => DeleteAccount()}>
        <View style={styles.buttonContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.buttonText}>
              CONFIRM DELETION
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default DeleteAccount

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.bgColor
  },
  AppBar: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    height: 60,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 10,
},
AppBarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
},
iconButton: {
  backgroundColor: "transparent",
  marginVertical: 10,
  padding: 10,
  borderRadius: 5
},
  descriptionBox: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginHorizontal: 10,
    backgroundColor: 'lightgrey',
  },
  buttonContainer: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: Colors.black
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
})