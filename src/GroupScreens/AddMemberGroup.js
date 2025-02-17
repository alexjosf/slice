import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Snackbar } from 'react-native-paper';
import userDataStore from '../../store';
import { ImageHolder } from '../_Components/ImageHolder';

//Default function to export
export default AddMemberGroup = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [members, setMembers] = useState([]);
  const gId = route.params.gId;

  const [snackBarText, setSnackBarText] = useState("")
  const [snackBarVisibility, setSnackBarVisibility] = useState(false)

  const friendID = userDataStore((state) => state.friendID)
  const friendDetails = userDataStore((state) => state.friendDetails)

  useEffect(() => {
    getFriends()
    async function getFriends() {
      setFriends(friendDetails)
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (gId) {
        firestore().collection("Groups").doc(gId).onSnapshot(documentSnapshot => {
          if (documentSnapshot && documentSnapshot.data()) {
            setMembers(documentSnapshot.data().members)
          }
        });
      }
    }

    return () => { isMounted = false; };
  }, [])


  const AddMemberAlert = (uid, gid) => {
    Alert.alert('ADD MEMBER', 'Do you want to add him/her to the group?',
      [
        {
          text: 'CANCEL',
          style: 'cancel',
        },
        {
          text: 'ADD',
          onPress: () => AddMemeber(uid, gid),
          color: 'black'
        },
      ]
    );
  }

  const AddMemeber = async (uid, gid) => {
    if (members.length == 25) {
      setSnackBarText("member limit reached")
      setSnackBarVisibility(!snackBarVisibility)
    }
    else if (members.includes(uid)) {
      setSnackBarText("Already a member")
      setSnackBarVisibility(!snackBarVisibility)
    }
    else {
      await firestore().collection("Groups").doc(gid).update({
        "members": firestore.FieldValue.arrayUnion(uid),
      });
      await firestore().collection("Users").doc(uid).set({
        "groups": firestore.FieldValue.arrayUnion(gid),
      }, { merge: true });
      setSnackBarText("Added new member")
      setSnackBarVisibility(!snackBarVisibility)
    }
  }



  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigation.goBack()}>
          <View style={styles.iconButton}>
            <Icon name='arrow-back-ios' size={20} color={Colors.black} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>
          Add Member
        </Text>
        <View style={styles.iconButton}>
          <Icon name='arrow-back-ios' size={20} color={'transparent'} />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.subContainer}>
          <Text style={styles.subText}>
            Friends
          </Text>
        </View>
        {loading ?
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
          :
          <ScrollView>
            <View style={{ flex: 1 }}>
              <FlatList
                data={friends}
                keyExtractor={item => item.uid}
                horizontal={false}
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => [AddMemberAlert(item.uid, gId)]}>
                      <View style={styles.memberListWrapper}>
                        <View style={styles.memberDataWrapper}>
                          {item.imageurl?
                          <Image source={{ uri: item.imageurl }} style={styles.memberListImage} />
                          :
                          <ImageHolder text={item.name} size={30} />
                          }
                          <Text style={styles.memberListName}>
                            {item.name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                }}
              />
            </View>
          </ScrollView>
        }
      </View>
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
  headerBox: {
    backgroundColor: Colors.white,
    height: 'auto',
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 15,
    elevation: 5,
    marginBottom: 10
  },
  iconButton: {
    backgroundColor: "transparent",
    padding: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center'
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  subContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  subText: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 5
  },
  buttonContainer: {
    backgroundColor: "royalblue",
    width: '90%',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    borderRadius: 5,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  memberListWrapper: {
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: Colors.white,
    borderRadius: 2,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  memberDataWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  memberListImage: {
    width: 30,
    height: 30,
    borderRadius: 30
  },
  memberListName: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: 14,
    marginLeft: 10
  },
})