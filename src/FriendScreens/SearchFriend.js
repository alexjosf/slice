import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Contacts from 'react-native-contacts';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Snackbar } from 'react-native-paper';

export default SearchFriend = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([])

  const [snackBarText, setSnackBarText] = useState("")
  const [snackBarVisibility, setSnackBarVisibility] = useState(false)

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
      title: 'Contacts',
      message: 'Give Permission for contacts to go further.',
      buttonPositive: 'Accept',
    })
      .then((res) => {
        console.log('Permission: ', res);
        Contacts.getAll()
          .then((contacts) => {
            let filterNumbers = contacts
              .map((item) => item["phoneNumbers"]).flat(1)
              .map((item) => item["number"]
                .replaceAll(" ", "")
                .replaceAll("-", "")
                .replaceAll("(", "")
                .replaceAll(")", ""))
            return filterNumbers = filterNumbers.filter((value, index) => filterNumbers.indexOf(value) === index)
          }).then((filterNumbers) => {
            getUsers(filterNumbers)
            console.log(filterNumbers)
          })
      })
      .catch((error) => {
        console.error('Permission error: ', error);
      })
    }

    return () => { isMounted = false; };
  }, [])

  async function getUsers(filterNumbers) {
    let myNumber = await firestore().collection("Users").doc(auth().currentUser.uid).get()
      .then(documentSnapshot => {
        if (documentSnapshot) {
          if (documentSnapshot.data()) {
            return (documentSnapshot.data().phoneno)
          }
        }
      })
      
    let numbers = await filterNumbers.filter(item => item !== myNumber)
    await firestore().collection("Users").get().then((snapshot) => {
      let temp = [];
      snapshot.docs.forEach(
        (document) => {
          if (document.exists) {
            numbers.forEach((item) => {
              if (item == document.data().phoneno) {
                temp.push(document.data())
              }
            })
          }
        }
      )
      setUsers(temp)
      setLoading(false)
    });
  }

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
    getFriendIDs()
    async function getFriendIDs() {
      let friendIDs = await firestore().collection("Users").doc(auth().currentUser.uid).collection("Friends")
        .get()
        .then((snapshot) => {
          let temp = [];
          snapshot.docs.forEach(
            (document) => {
              if (document.exists) {
                temp.push(document.ref.id)
              }
            }
          )
          return temp
        }).catch(
          (error) => { console.log(error) }
        )
      console.log(friendIDs)
      setFriends(friendIDs)
    }
  }

  return () => { isMounted = false; };
  }, [])

  const AddFriendAlert = (uid) => {
    Alert.alert('ADD FRIEND', 'Do you want to add him/her as friend?',
      [
        {
          text: 'CANCEL',
          style: 'cancel',
        },
        {
          text: 'ADD FRIEND',
          onPress: () => AddFriend(uid),
          color: 'black'
        },
      ]
    );
  }

  const AddFriend = async (uid) => {
    if (friends.includes(uid)) {
      setSnackBarText("Already a friend")
      setSnackBarVisibility(!snackBarVisibility)
    }
    else {
      await firestore().collection("Users").doc(auth().currentUser.uid).collection("Friends").doc(uid).set({
        "uid": uid,
      });
      setSnackBarText("Added a new friend")
      setSnackBarVisibility(!snackBarVisibility)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.AppBar}>
        <Text style={styles.AppBarText}>
          Search Friends
        </Text>
      </View>
      {loading ?
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
        :
        <FlatList
          data={users}
          keyExtractor={item => item.uid}
          horizontal={false}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => AddFriendAlert(item.uid)}>
                <View style={styles.friendListWrapper}>
                  <View style={styles.friendDataWrapper}>
                    <Image source={{ uri: item.imageurl }} style={styles.friendListImage} />
                    <Text style={styles.friendListName}>
                      {item.name}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />}
      <Snackbar
        elevation={10}
        duration={1200}
        visible={snackBarVisibility}
        onDismiss={() => { setSnackBarVisibility(!snackBarVisibility) }}>
        {snackBarText}
      </Snackbar>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.shade1
  },
  AppBar: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    height: 65,
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  AppBarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  friendListWrapper: {
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  friendDataWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  friendListImage: {
    width: 40,
    height: 40,
    borderRadius: 50
  },
  friendListName: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: 14,
    marginLeft: 10
  },
})
