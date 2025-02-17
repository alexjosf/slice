import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Dimensions
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default Register = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");

  const [alert, setAlert] = useState("")


  const AddUserDetails = async (name) => {
    const usersCollection = firestore().collection("Users").doc(auth().currentUser.uid);
    await usersCollection.set({
      "uid": auth().currentUser.uid,
      "name": name,
      "phoneno": auth().currentUser.phoneNumber,
      "groups":[],
      "imageurl": ""
    }, { merge: true })
    navigation.replace('BottomNav')
  }

  const CreateAccount = async (name) => {
    if (name.trim().split(" ").length <= 1) {
      setAlert("Empty field")
    }
    else {
      await auth().currentUser.updateProfile({
        displayName: name,
      }).then(
        AddUserDetails(name)
      ).catch(
        (error) => {
          console.log(error)
        }
      )

    }
  }

  // function validateEmail(email) {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.mainText}>
        It's a new account. Enter the details.
      </Text>
      <View style={{ height: 25 }} />
      <View style={{ flexDirection: 'row' }}>
        <TextInput style={styles.inputText}
          placeholder='Full Name'
          value={name}
          onChangeText={text => setName(text)} />
      </View>
      <Text style={styles.alertText}>
        {alert}
      </Text>

      <View style={{ flexDirection: 'row' }}>
        <TouchableHighlight style={styles.buttonContainer} underlayColor="white"
          onPress={() => CreateAccount(name)}>
          <Text style={styles.buttonText}>
            CREATE ACCOUNT
          </Text>
        </TouchableHighlight>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 50,
    padding: 20
  },
  mainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  inputText: {
    marginTop: 20,
    backgroundColor: 'lightgrey',
    paddingLeft: 10,
    flexGrow: 1,
    borderRadius: 5,
  },
  buttonContainer: {
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: 5,
    padding: 12,
    flexGrow: 1
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  alertText: {
    alignSelf: 'flex-start',
    marginLeft: 25,
    fontSize: 12,
    color: Colors.red,
  },
  modalView: {
    width: Dimensions.get('window').width - 20,
    height: Dimensions.get('window').width - 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    margin: 10,
    elevation: 0,
    backgroundColor: 'black'
  },
  modalText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})