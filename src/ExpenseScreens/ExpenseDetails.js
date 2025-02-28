import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import CategoryData from '../../assets/data/CategoryData';
import SettleImageData from '../../assets/data/SettleImageData';
import DateString from '../_Components/DateString';
import axios from 'axios';
import { ImageHolder } from '../_Components/ImageHolder';
import { ImageHolderGroup } from '../_Components/ImageHolderGroup';

import userDataStore from '../../store';

export default function ExpenseDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  // Details of expense
  const eData = route.params.eData
  // Currency used by user
  const currency = route.params.currency
  // Random number generated for image sof settle
  const random = route.params.random
  // Name of friend for settle expense
  const name = route.params.name

  // Get members Data involved in the transaction. 
  const [membersData, setMembersData] = useState([])
  // Set users who paid
  const [paidUserData, setPaidUserData] = useState([])
  // Set users who split
  const [splitUserData, setSplitUserData] = useState([])
  // Set who ows whom how much
  const [payeesData, setPayeesData] = useState([])
  // Get data if it is a group expense
  const [groupInfo, setGroupInfo] = useState()
  // Set which view is need
  const [flipSplit, setFlipSplit] = useState(false)
  // Set who added the expense
  const [addedBy, setAddedBy] = useState('')

  const userData = userDataStore((state) => state.userData)
  const groupDetails = userDataStore((state) => state.groupDetails)
  const friendDetails = userDataStore((state) => state.friendDetails)

  useEffect(() => {
    getUser()
    // If not added by current user
    async function getUser() {
      if (eData.uid != auth().currentUser.uid) {
        // Get who added the transaction
        let add = (await firestore().collection("Users").doc(eData.uid).get()).data().name
        setAddedBy(add)
      }
      else {
        // If added by current user
        setAddedBy('you')
      }
    }
  }, [])

  useEffect(() => {
    getGroups()
    async function getGroups() {
      //If group transaction
      if (eData.group) {
        // Get the group details
        let groupData = groupDetails.filter(item => item.gid == eData.group)
        setGroupInfo(groupData.pop())
      }
    }
  }, [])

  useEffect(() => {
    getMembers()
    async function getMembers() {
      // If users involved in the transaction
      if (eData.members) {
        let members = eData.members
        let temp = []
        const friendPromises = members.map(async (item) => {
          const document = await firestore().collection("Users").doc(item).get();
          if (document.exists) { temp.push(document.data()) }
        });
        await Promise.all(friendPromises);
        setMembersData(temp)
      }
    }
  }, [])

  useEffect(() => {
    getData()
    async function getData() {
      // Only run if paid and split and members
      if (eData.paid && eData.split && eData.members) {
        let paid = Object.keys(eData.paid)
        let split = Object.keys(eData.split)
        let payees = eData.payees
        console.log(payees)
        let members = membersData
        let temp = []
        // Get paid user data
        for (i in paid) {
          members.forEach(
            (member) => {
              if (member.uid == paid[i]) {
                temp.push(member)
              }
            }
          )
        }
        // Set paid user data
        setPaidUserData(temp)
        let temp2 = {}
        // Get who owes whom how much data
        for (reciever in payees) {
          for (payer in payees[reciever]) {
            for (i in members) {
              for (j in members) {
                if (members[i].uid === reciever && members[j].uid === payer) {
                  id = i + j
                  if (temp2[members[i]['uid']]) {
                    let temp3 = temp2[members[i]['uid']]
                    let line = '     ' + members[j]['name'] + ' owes ' + currency + payees[reciever][payer]
                    temp3.push({ 'id': id, 'title': line })
                    temp2[members[i]['uid']] = temp3
                  }
                  else {
                    let temp3 = []
                    let line = '     ' + members[j]['name'] + ' owes ' + currency + payees[reciever][payer]
                    temp3.push({ 'id': id, 'title': line })
                    temp2[members[i]['uid']] = temp3
                  }
                }
              }
            }
          }
        }
        // Set who owes whom how much data
        setPayeesData(temp2)
        let temp3 = []
        // Get paid user datas
        for (i in split) {
          members.forEach(
            (member) => {
              if (member.uid == split[i]) {
                temp3.push(member)
              }
            }
          )
        }
        // Set paid user datas
        setSplitUserData(temp3)
      }
    }
    // Run when member data is set
  }, [membersData])

  // Delete expense Alert
  const DeleteExpenseAlert = (eMembers, eTotalAmount, eId, eType, eDescription, ePayees, eGroup, eAmount) => {
    Alert.alert('DELETE EXPENSE', 'Do you really want to delete this expense?',
      [
        {
          text: 'CANCEL',
          // Cancel expense delete alert
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'DELETE EXPENSE',
          // Confirm expense delete alert
          onPress: () => [DeleteExpense(eMembers, eTotalAmount, eId, eType, eDescription, ePayees, eGroup, eAmount)],
          color: 'black'
        },
      ]
    );
  }

  // Delete expense function
  const DeleteExpense = async (eMembers, eTotalAmount, eId, eType, eDescription, ePayees, eGroup, eAmount) => {

    // Transaction field and select the transaction id
    let fieldName = "transactions." + eId
    console.log(fieldName)

    if (eType == "Settlement Expense") {

      // Path to the friend collection
      let getPath = firestore().collection("Users").doc(eMembers[0]).collection("Friends").doc(eMembers[1])
      let payPath = firestore().collection("Users").doc(eMembers[1]).collection("Friends").doc(eMembers[0])

      // If data exists else undefined
      let getBalance = (await getPath.get()).data()
      let payBalance = (await payPath.get()).data()

      // If friend and balance exist for payer
      if (getBalance && getBalance.balanceAmount) {
        await getPath.update({
          [fieldName]: firestore.FieldValue.delete(),
          uid: eMembers[1],
          balanceAmount: +parseFloat(getBalance.balanceAmount - eAmount).toFixed(2),
        })
      }
      // if not friend any more
      else {
        await getPath.set({
          uid: eMembers[1],
          balanceAmount: +parseFloat(- eAmount).toFixed(2),
        }, { merge: true })
      }

      // If friend and balance exist for reciever
      if (payBalance && payBalance.balanceAmount) {
        await payPath.update({
          [fieldName]: firestore.FieldValue.delete(),
          uid: eMembers[0],
          balanceAmount: +parseFloat(payBalance.balanceAmount + eAmount).toFixed(2),
        })
      }
      // if not friend any more
      else {
        await payPath.set({
          uid: eMembers[0],
          balanceAmount: +parseFloat(+ eAmount).toFixed(2),
        }, { merge: true })
      }

      // Delete from transactions
      await firestore().collection("Transactions").doc(eId).delete()



      let token1 = (await firestore().collection("Users").doc(eMembers[0]).get()).data().token
      sendPushNotificationSettlement(eAmount, token1)
      let token2 = (await firestore().collection("Users").doc(eMembers[1]).get()).data().token
      sendPushNotificationSettlement(eAmount, token2)

      navigation.goBack()
    }
    // Else if group or friend settlement
    else {
      // For each user invoved
      for (receiver in ePayees) {
        for (payer in ePayees[receiver]) {
          let getPath = firestore().collection("Users").doc(receiver).collection("Friends").doc(payer)
          let payPath = firestore().collection("Users").doc(payer).collection("Friends").doc(reciever)
          let getBalance = (await getPath.get()).data()
          let payBalance = (await payPath.get()).data()

          // If friend and balance exist for payer
          if (getBalance && getBalance.balanceAmount) {
            await getPath.update({
              [fieldName]: firestore.FieldValue.delete(),
              uid: payer,
              balanceAmount: +parseFloat(getBalance.balanceAmount - ePayees[receiver][payer]).toFixed(2),
            })
          }
          else {
            await getPath.set({
              uid: payer,
              balanceAmount: +parseFloat(- ePayees[receiver][payer]).toFixed(2),
            }, { merge: true })
          }

          // If friend and balance exist for reciever
          if (payBalance && payBalance.balanceAmount) {
            await payPath.update({
              [fieldName]: firestore.FieldValue.delete(),
              uid: receiver,
              balanceAmount: +parseFloat(payBalance.balanceAmount + ePayees[receiver][payer]).toFixed(2),
            })
          }
          else {
            await payPath.set({
              uid: receiver,
              balanceAmount: +parseFloat(+ ePayees[receiver][payer]).toFixed(2),
            }, { merge: true })
          }
        }
      }
      // Delete transaction for all member
      await firestore().collection("Transactions").doc(eId).delete()

      //Send push notification
      for (let i in eMembers) {
        let token = (await firestore().collection("Users").doc(eMembers[i]).get()).data().token
        sendPushNotificationExpense(eTotalAmount, eDescription, eAmount[eMembers[i]], token)
      }
      // Delete transaction in  group if a group transaction
      if (eGroup) {
        await firestore().collection("Groups").doc(eGroup)
          .set({
            transactions: firestore.FieldValue.arrayRemove(eId)
          }, { merge: true })
      }
      navigation.goBack()
    }
  }


  const user = (userId) => {
    // If user is current user return you
    if (userId == auth().currentUser.uid) {
      return 'you'
    }
    else {
      return name
    }
  }

  const sendPushNotificationSettlement = (amount, token) => {
    if (token) {
      axios.post('https://orange-slice-server.onrender.com/deleteSettlement',
        {
          currency: currency,
          amount: amount,
          user: userData.name,
          token: token
        })
        .then(response => {
          console.log(response.data); // Logs the response data
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }

  const sendPushNotificationExpense = (totalAmount, description, amount, token) => {
    if (token) {
      axios.post('https://orange-slice-server.onrender.com/deleteExpense',
        {
          user: userData.name,
          description: description,
          totalAmount: totalAmount,
          currency: currency,
          amount: amount,
          token: token
        })
        .then(response => {
          console.log(response.data); // Logs the response data
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }

  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.AppBar}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigation.goBack()}>
          <View style={styles.iconButton}>
            <Icon2 name='arrow-back-ios' size={20} color={Colors.black} />
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => DeleteExpenseAlert(eData.members, eData.totalamount, eData.tid, eData.type, eData.description, eData.payees, eData.group, eData.amount)}>
            <View style={styles.iconButton}>
              <Icon name='delete' size={24} color={Colors.red} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {(eData.type == 'Settlement Expense') ?
        <View style={{ backgroundColor: Colors.white, flex: 1, alignItems: 'center', }}>
          <View style={{ height: 50 }} />
          <Image source={SettleImageData[random]} style={{ height: 125, width: 125 }} />
          <Text style={{ color: Colors.black, fontSize: 18 }}>
            {user(eData.members[0])} paid {user(eData.members[1])}
          </Text>
          <Text style={{ color: Colors.black, fontSize: 30, fontWeight: 'bold' }}>
            {currency}{eData.amount}
          </Text>
          <Text style={{ color: Colors.black }}>Added by {addedBy.split(' ')[0]} on {DateString(eData.date)}</Text>
          <Text style={{ color: Colors.black }}>{eData.transfer}</Text>
        </View>
        :
        <ScrollView>
          <View style={styles.amountDataContainer}>
            <View style={[styles.categoryContainer, { backgroundColor: 'white' }]}>
              <Icon name={CategoryData[eData.category]['iconname']} size={20} color={'blue'} />
              <Text style={{ marginLeft: 5, color: 'black' }}>{CategoryData[eData.category]['name']}</Text>
            </View>
            <Text style={{ color: Colors.black, fontSize: 30, fontWeight: 'bold' }}>
              {currency}{eData.totalamount}
            </Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>{eData.description}</Text>
            <Text>{DateString(eData.date).split(" ")[2]} {DateString(eData.date).split(" ")[1]} {DateString(eData.date).split(" ")[3]}</Text>
            {groupInfo ?
              <View style={[styles.groupWrapper]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {(groupInfo.imageurl) ?
                    <Image source={{ uri: groupInfo.imageurl }} style={styles.groupImage} />
                    :
                    <ImageHolderGroup emoji={groupInfo.emoji} size={30} num={groupInfo.imagenum} />
                  }
                  <Text style={styles.groupName}>
                    {groupInfo.gname}
                  </Text>
                </View>
              </View>
              : <View />
            }
            <Text style={{ marginTop: 10, color: Colors.black }}>
              Added by {addedBy.split(' ')[0]} on {DateString(eData.date)}
            </Text>
          </View>
          {(eData.split && eData.paid && eData.members) ?
            <View style={styles.bottomContainer}>
              <View style={styles.subContainer}>
                <Text style={styles.subText}>
                  Paid By
                </Text>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => setFlipSplit(!flipSplit)}>
                  <View style={{ paddingHorizontal: 5 }}>
                    <Icon name='swap-vertical' size={24} color={Colors.black} />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  data={paidUserData}
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  keyExtractor={item => item.uid}
                  renderItem={({ item }) => (
                    <View>
                      <View style={[styles.friendListWrapper]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {(item.imageurl) ?
                            <Image source={{ uri: item.imageurl }} style={styles.friendListImage} />
                            :
                            <ImageHolder text={item.name} size={30} num={item.imagenum} />
                          }
                          <Text style={styles.friendListName}>
                            {item.name}
                          </Text>
                        </View>
                        <View style={{ width: '25%', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Text style={{
                            fontWeight: 'bold',
                            fontSize: 14,
                            color: Colors.green,
                          }}>
                            {currency}{eData.paid[item.uid]}
                          </Text>
                        </View>
                      </View>
                      {(!flipSplit) ?
                        <FlatList
                          data={payeesData[item.uid]}
                          horizontal={false}
                          showsVerticalScrollIndicator={false}
                          scrollEnabled={false}
                          keyExtractor={item => item.id}
                          renderItem={({ item }) => (
                            <View style={{ margin: 5, marginHorizontal: 10 }}>
                              <View>
                                <Text>
                                  {item['title']}
                                </Text>
                              </View>
                            </View>
                          )}
                        /> :
                        <View />
                      }
                    </View>
                  )}
                />
              </View>
              {(flipSplit) ?
                <View>
                  <View style={styles.subContainer}>
                    <Text style={styles.subText}>
                      Split Between
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <FlatList
                      data={splitUserData}
                      horizontal={false}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false}
                      keyExtractor={item => item.uid}
                      renderItem={({ item }) => (
                        <View>
                          <View style={[styles.friendListWrapper]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              {(item.imageurl) ?
                                <Image source={{ uri: item.imageurl }} style={styles.friendListImage} />
                                :
                                <ImageHolder text={item.name} size={30} num={item.imagenum} />
                              }
                              <Text style={styles.friendListName}>
                                {item.name}
                              </Text>
                            </View>
                            <View style={{ width: '25%', alignItems: 'flex-end', justifyContent: 'center' }}>
                              <Text style={{
                                fontWeight: 'bold',
                                fontSize: 14,
                                color: Colors.red,
                              }}>
                                {currency}{eData.split[item.uid]}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    />
                  </View>
                </View> :
                <View />
              }
            </View>
            :
            <View />}
        </ScrollView>
      }

    </View>
  )
}

const styles = StyleSheet.create({
  AppBar: {
    backgroundColor: Colors.white,
    height: 60,
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  iconButton: {
    backgroundColor: "transparent",
    marginVertical: 5,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center'
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.green
  },
  categoryContainer: {
    margin: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    borderWidth: 1,
  },
  amountDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingBottom: 30
  },
  subContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
    marginVertical: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  subText: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 5
  },
  bottomContainer: {
    flex: 1,
  },
  friendListWrapper: {
    margin: 5,
    marginHorizontal: 10,
    backgroundColor: Colors.white,
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  friendListImage: {
    width: 30,
    height: 30,
    borderRadius: 30
  },
  friendListName: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: 14,
    marginLeft: 10
  },
  groupWrapper: {
    marginTop: 5,
    borderWidth: 0.5,
    backgroundColor: Colors.white,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  groupImage: {
    width: 30,
    height: 30,
    borderRadius: 30
  },
  groupName: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: 14,
    marginLeft: 10
  },
})