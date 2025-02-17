import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Dimensions,
  Image,
  ActivityIndicator
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker'
import uuid from 'react-native-uuid';
import CategoryData from '../../assets/data/CategoryData';
import { Snackbar } from 'react-native-paper';
import CountryData from '../../assets/data/CountryData';
import axios from 'axios';
import userDataStore from '../../store';

export default AddExpense = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const uId = route.params.uId;
  const gId = route.params.gId;
  const friendIDs = route.params.friendIDs;

  // Variables with firebase data
  const [postID, setPostID] = useState(uuid.v4())
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date())
  const [paidByAmount, setPaidByAmount] = useState({})
  const [splitByAmount, setSplitByAmount] = useState({})
  const [groupSelected, setGroupSelected] = useState()
  const [payeeAmount, setPayeeAmount] = useState()
  const [oweAmount, setOweAmount] = useState()

  const [dateOpen, setDateOpen] = useState(false)
  const [paidEqual, setPaidEqual] = useState(true)
  const [splitEqual, setSplitEqual] = useState(true)

  const [members, setMembers] = useState([])
  const [groups, setGroups] = useState()
  const [friends, setFriends] = useState([])

  const [groupModalVisibility, setGroupModalVisibility] = useState(false)
  const [paidModalVisibility, setPaidModalVisibility] = useState(false)
  const [splitModalVisibility, setSplitModalVisibility] = useState(false)

  const [paidBy, setPaidBy] = useState([])
  const [splitBy, setSplitBy] = useState([])
  const [selectedPaidByData, setSelectedPaidByData] = useState([])
  const [selectedSplitByData, setSelectedSplitByData] = useState([])
  const [transactionMembers, setTransactionMembers] = useState([])

  const [snackBarText, setSnackBarText] = useState("")
  const [snackBarVisibility, setSnackBarVisibility] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState();

  const updateExpenseLive = userDataStore((state) => state.updateExpenseLive)

  useEffect(() => {
    if (gId) {
      firestore().collection("Groups").doc(gId)
        .get().then(
          document => {
            setGroupSelected(document.data())
          }
        )
    }
    getGroups()
    async function getGroups() {
      let userData = (await firestore().collection("Users").doc(auth().currentUser.uid).get()).data()
      setUserData(userData)
      let groupIDs = await firestore().collection("Users").doc(auth().currentUser.uid)
        .get()
        .then((document) => {
          if (document.exists) {
            return document.data().groups
          }
        })
        .catch((error) => {
          console.log(error)
        })
      try {
        await firestore().collection("Groups").get().then((snapshot) => {
          let temp = [];
          snapshot.docs.forEach(
            (document) => {
              if (document.exists) {
                // if (gId && gId == document.data().gid || eData.group == document.data().gid) {
                //   setGroupSelected(document.data())
                // }
                groupIDs.forEach((item) => {
                  if (item == document.data().gid) {
                    temp.push(document.data())
                  }
                })
              }
            }
          )
          setGroups(temp)
        });
      } catch (error) {
        console.log(error)
      }
    }
  }, []);

  useEffect(() => {
    getFriends()
    async function getFriends() {
      let friendList = friendIDs
      // If opened from group screen
      if (!friendList) {
        friendList = await firestore().collection("Users").doc(auth().currentUser.uid).collection("Friends")
          .get()
          .then((snapshot) => {
            let temp = [];
            snapshot.docs.forEach(
              (document) => {
                if (document.exists) {
                  temp.push(document.data().uid)
                }
              })
            return temp
          }).catch(
            (error) => { console.log(error) }
          )
      }
      // Get details of users who are in friendlist array
      await firestore().collection("Users").get().then((snapshot) => {
        const temp = [];
        snapshot.docs.forEach(
          (document) => {
            if (document.data().uid == auth().currentUser.uid) {
              setSelectedPaidByData([document.data()])
              setPaidBy([auth().currentUser.uid])
              temp.push(document.data())
            }
            else if (document.data().uid == uId) {
              setSelectedSplitByData([document.data()])
              setSplitBy([uId])
              temp.push(document.data())
            }
            else if (document.exists) {
              friendList.forEach((item) => {
                if (item == document.data().uid) {
                  temp.push(document.data())
                }
              })
            }
          }
        )
        setFriends(temp)
      });
    }
  }, []);

  useEffect(() => {
    if (groupSelected) {
      let groupMembers = groupSelected['members']
      getMembers()
      async function getMembers() {
        await firestore().collection("Users").get().then((snapshot) => {
          let temp = [];
          snapshot.docs.forEach(
            (document) => {
              if (document.data().uid == auth().currentUser.uid) {
                setSelectedPaidByData([document.data()])
                setPaidBy([auth().currentUser.uid])
              }
              if (document.exists) {
                groupMembers.forEach((item) => {
                  if (item == document.data().uid) {
                    temp.push(document.data())
                  }
                })
              }
            }
          )
          setMembers(temp)
        })
      }
    }
  }, [groupSelected])

  useEffect(() => {
    let temp = {}
    if (paidEqual == true && amount > 0 && paidBy.length >= 1) {
      let baseValue = Math.floor((amount / paidBy.length) * 100) / 100;
      let remainder = Math.round((amount - baseValue * paidBy.length) * 100);
      let portions = Array(paidBy.length).fill(baseValue);
      for (let i = 0; i < remainder; i++) {
        portions[i] = Math.round((portions[i] + 0.01) * 100) / 100;
      }
      for (i in paidBy) {
        temp[paidBy[i]] = String(portions[i])
      }
      setPaidByAmount(temp)
    } else {
      setPaidByAmount(temp)
    }
  }, [paidEqual, members, friends, amount])

  useEffect(() => {
    let temp = {}
    if (splitEqual == true && amount > 0 && splitBy.length >= 1) {
      let baseValue = Math.floor((amount / splitBy.length) * 100) / 100;
      let remainder = Math.round((amount - baseValue * splitBy.length) * 100);
      let portions = Array(splitBy.length).fill(baseValue);
      for (let i = 0; i < remainder; i++) {
        portions[i] = Math.round((portions[i] + 0.01) * 100) / 100;
      }
      for (i in splitBy) {
        temp[splitBy[i]] = String(portions[i])
      }
      setSplitByAmount(temp)
    } else {
      setSplitByAmount(temp)
    }
  }, [splitEqual, members, friends, amount])

  useEffect(() => {
    assignCreditDebit()
  }, [splitByAmount, paidByAmount])

  const addTransaction = async (transactionID, amount, description, category, date, groupSelected, paidByAmount, splitByAmount, payeeAmount, transactionMembers, oweAmount) => {
    setSaving(!saving)
    let transactionType = ''
    let postID = ''
    if (groupSelected) {
      transactionType = 'Group Expense'
      postID = 'g-' + transactionID
    } else {
      transactionType = 'Friend Expense'
      postID = 'f-' + transactionID
    }

    if (transactionType == 'Group Expense') {

      let transaction = {
        "tid": postID,
        "uid": auth().currentUser.uid,
        "totalamount": amount,
        "description": description,
        "category": category,
        "date": firestore.Timestamp.fromDate(date),
        "type": transactionType,
        "amount": oweAmount,
        "paid": paidByAmount,
        "split": splitByAmount,
        "payees": payeeAmount,
        "members": transactionMembers,
        "group": groupSelected['gid']
      }

      updateExpenseLive(transaction)

      await firestore().collection("Transactions").doc(postID).set(transaction, { merge: true })

      await firestore().collection("Groups").doc(groupSelected['gid']).set({
        transactions: firestore.FieldValue.arrayUnion(postID)
      }, { merge: true })
    }
    else {
      let transaction = {
        "tid": postID,
        "uid": auth().currentUser.uid,
        "totalamount": amount,
        "description": description,
        "category": category,
        "date": firestore.Timestamp.fromDate(date),
        "type": transactionType,
        "amount": oweAmount,
        "paid": paidByAmount,
        "split": splitByAmount,
        "payees": payeeAmount,
        "members": transactionMembers
      }

      await firestore().collection("Transactions").doc(postID)
        .set(transaction, { merge: true })
    }

    for (receiver in payeeAmount) {
      for (payer in payeeAmount[receiver]) {
        let getPath = firestore().collection("Users").doc(receiver).collection("Friends").doc(payer)
        let payPath = firestore().collection("Users").doc(payer).collection("Friends").doc(receiver)
        let getBalance = (await getPath.get()).data()
        let payBalance = (await payPath.get()).data()

        if (getBalance && getBalance.balanceAmount) {
          await getPath.set({
            transactions: { [postID]: 'unsettled' },
            uid: payer,
            balanceAmount: +parseFloat(getBalance.balanceAmount + payeeAmount[receiver][payer]).toFixed(2),
          }, { merge: true })
        }
        else {
          await getPath.set({
            transactions: { [postID]: 'unsettled' },
            uid: payer,
            balanceAmount: payeeAmount[receiver][payer],
          }, { merge: true })
        }

        if (payBalance && payBalance.balanceAmount) {
          await payPath.set({
            transactions: { [postID]: 'unsettled' },
            uid: receiver,
            balanceAmount: +parseFloat(payBalance.balanceAmount - payeeAmount[receiver][payer]).toFixed(2),
          }, { merge: true })
        }
        else {
          await payPath.set({
            transactions: { [postID]: 'unsettled' },
            uid: receiver,
            balanceAmount: -payeeAmount[receiver][payer],
          }, { merge: true })
        }
      }
    }

    for (i in transactionMembers) {
      let token = (await firestore().collection("Users").doc(transactionMembers[i]).get()).data().token
      sendPushNotificationExpense(description, amount, oweAmount[transactionMembers[i]], token)
    }
    navigation.goBack()
  }


  const expenseValidation = (postID, amount, description, category, date, groupSelected, paidByAmount, splitByAmount, payeeAmount, transactionMembers, oweAmount) => {
    // Validate amount  is not empty
    if (amount.trim() == "") {
      setSnackBarText("Enter an amount")
      setSnackBarVisibility(!snackBarVisibility)
    }
    // Validate amount is not negative or zero or string or anything else
    else if (Math.sign(amount.trim()) != 1 || isNaN(amount.trim())) {
      setSnackBarText("Not a valid amount")
      setSnackBarVisibility(!snackBarVisibility)
    }
    // Validate description is not empty
    else if (description.trim() == "") {
      setSnackBarText("Add a description")
      setSnackBarVisibility(!snackBarVisibility)
    }
    // Validate category is not empty
    else if (category.trim() == "") {
      setSnackBarText("Select a category")
      setSnackBarVisibility(!snackBarVisibility)
    }
    else if (Object.keys(paidByAmount).length < 1 || Object.keys(splitByAmount).length < 1) {
      setSnackBarText("Add payer, payee and amounts")
      setSnackBarVisibility(!snackBarVisibility)
    }
    else if (transactionMembers.length == 1) {
      setSnackBarText("Invalid expense")
      setSnackBarVisibility(!snackBarVisibility)
    }
    else if (checkForTally(amount, paidByAmount, splitByAmount)) {
      setSnackBarVisibility(!snackBarVisibility)
    }
    else {
      //Call the fuction to add data to firebase
      addTransaction(postID, amount, description, category, date, groupSelected, paidByAmount, splitByAmount, payeeAmount, transactionMembers, oweAmount)
    }
  };

  //Paid by modal function
  const addPaidByFriend = (paidByMember) => {
    let temp = paidBy
    let temp2 = selectedPaidByData
    let temp3 = paidByAmount

    if (!temp.includes(paidByMember.uid)) {
      temp.push(paidByMember.uid)
      temp2.push(paidByMember)
      setPaidBy(temp)
      setSelectedPaidByData(temp2)
    }
    else if (temp.includes(paidByMember.uid)) {
      let removedTemp = temp.filter(e => { return e != paidByMember.uid })
      setPaidBy(removedTemp)
      delete temp3[paidByMember.uid]
      setPaidByAmount(temp3)
      let removedTemp2 = temp2.filter(e => { return e != paidByMember })
      setSelectedPaidByData(removedTemp2)
    }

    if (groupSelected) {
      setMembers([...members])
    }
    else {
      setFriends([...friends])
    }
  }

  //Split between modal function
  const addSplitByFriend = (splitByMember) => {
    let temp = splitBy
    let temp2 = selectedSplitByData
    let temp3 = splitByAmount

    if (!temp.includes(splitByMember.uid)) {
      temp.push(splitByMember.uid)
      temp2.push(splitByMember)
      setSplitBy(temp)
      setSelectedSplitByData(temp2)
    }
    else if (temp.includes(splitByMember.uid)) {
      let removedTemp = temp.filter(e => { return e != splitByMember.uid })
      setSplitBy(removedTemp)
      delete temp3[splitByMember.uid]
      setSplitByAmount(temp3)
      let removedTemp2 = temp2.filter(e => { return e != splitByMember })
      setSelectedSplitByData(removedTemp2)
    }

    if (groupSelected) {
      setMembers([...members])
    } else {
      setFriends([...friends])
    }
  }

  //Update  paid by section amount for each users in flatlist
  const changePaidByAmount = (uId, amount) => {
    let temp = paidByAmount
    temp[uId] = amount.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
    if (amount == "") {
      delete temp[uId]
    }
    setPaidByAmount(temp)
    assignCreditDebit()
    setSelectedPaidByData([...selectedPaidByData])
  }

  //Update  paid by section amount for each users in flatlist
  const changeSplitByAmount = (uId, amount) => {
    let temp = splitByAmount
    temp[uId] = amount.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1')
    if (amount == "") {
      delete temp[uId]
    }
    setSplitByAmount(temp)
    assignCreditDebit()
    setSelectedSplitByData([...selectedSplitByData])
  }

  const checkForTally = (totalAmount, paidamount, splitamount) => {
    let paidTotal = 0
    let splitTotal = 0
    for (item of Object.values(paidamount)) {
      paidTotal += Number(item)
    }
    for (item of Object.values(splitamount)) {
      splitTotal += Number(item)
    }
    if (paidTotal != totalAmount) {
      setSnackBarText("Paid amount doesn't add up to total. Off by " + (totalAmount - paidTotal))
      return true
    }
    if ((paidTotal - splitTotal) != 0) {
      setSnackBarText("Amounts are not balanced. Difference of " + (paidTotal - splitTotal))
      return true
    }
    return false
  }

  const assignCreditDebit = () => {
    let paid = paidByAmount
    let split = splitByAmount
    let numTotal = {}
    for (let i in paid) {
      numTotal[i] = Number(paid[i])
    }
    for (let i in split) {
      if (Object.keys(numTotal).includes(i)) {
        numTotal[i] = +parseFloat(Number(paid[i]) - Number(split[i])).toFixed(2)
      }
      else {
        numTotal[i] = - Number(split[i])
      }
    }
    let creditor = []
    let debtor = []
    for (let i in numTotal) {
      if (numTotal[i] > 0) {
        creditor.push({ 'user': i, 'amount': numTotal[i] })
      }
      else if (numTotal[i] < 0) {
        debtor.push({ 'user': i, 'amount': Math.abs(numTotal[i]) })
      }
    }
    creditor = creditor.sort((a, b) => b.amount - a.amount)
    debtor = debtor.sort((a, b) => b.amount - a.amount)
    console.log('Creditor')
    console.log(creditor)
    console.log('Debtor')
    console.log(debtor)

    let payees = {}
    let i = 0, j = 0
    while (i < creditor.length && j < debtor.length) {
      if (creditor[i].amount > debtor[j].amount) {
        if (debtor[j].amount != 0) {
          if (!payees[creditor[i].user]) {
            payees[creditor[i].user] = {};
          }
          payees[creditor[i].user][debtor[j].user] = debtor[j].amount
        }
        creditor[i].amount = +parseFloat(creditor[i].amount - debtor[j].amount).toFixed(2)
        debtor[j].amount = 0
        j++
      } else {
        if (creditor[i].amount != 0) {
          if (!payees[creditor[i].user]) {
            payees[creditor[i].user] = {};
          }
          payees[creditor[i].user][debtor[j].user] = creditor[i].amount
        }
        debtor[j].amount = +parseFloat(debtor[j].amount - creditor[i].amount).toFixed(2)
        creditor[i].amount = 0
        i++
      }
    }
    console.log(payees)
    setPayeeAmount(payees)
    setOweAmount(numTotal)
    console.log(oweAmount)
    setTransactionMembers(Object.keys(numTotal))
    console.log("Transactions")
    console.log(payees)
  }

  const setGroup = (group) => {
    if (groupSelected == group) {
      setGroupSelected()
      setPaidBy([])
      setSelectedPaidByData([])
      setPaidByAmount({})
      setSplitBy([])
      setSelectedSplitByData([])
      setSplitByAmount({})
    } else {
      setGroupSelected(group)
      setPaidBy([])
      setSelectedPaidByData([])
      setPaidByAmount({})
      setSplitBy([])
      setSelectedSplitByData([])
      setSplitByAmount({})
    }
  }

  const selectAll = () => {
    if (members.length != splitBy.length) {
      for (i in members) {
        addSplitByFriend(members[i])
      }
    }
  }

  const sendPushNotificationExpense = (description, totalAmount, amount, token) => {
    if (token) {
      axios.post('https://orange-slice-server.onrender.com/addExpense',
        {
          user: userData.name,
          description: description,
          totalAmount: totalAmount,
          currency: CountryData[userData.country]['currency'],
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
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-evenly" }}>
        <View style={styles.groupWrapper}>
          {(groupSelected) ?
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Image source={{ uri: groupSelected['imageurl'] }} style={styles.memberListImage} />
              <Text style={styles.memberListText}>
                {groupSelected['gname']}
              </Text>
            </View> :
            <Text>Select a group</Text>}
          <TouchableHighlight
            style={{ borderRadius: 30 }}
            underlayColor={'skyblue'}
            onPress={() => setGroupModalVisibility(!groupModalVisibility)}>
            <Icon name='plus' size={26} color={Colors.black} />
          </TouchableHighlight>
        </View>
        <TouchableOpacity onPress={() => setDateOpen(!dateOpen)}>
          <View style={styles.iconPanel}>
            <View style={{ flexDirection: 'row', alignItems: "center", }}>
              <Icon name='calendar-edit' size={24} color={Colors.black} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <TextInput style={styles.inputAmount}
            maxLength={10}
            keyboardType="numeric"
            placeholder='00.00'
            numberOfLines={1}
            value={amount}
            onChangeText={text => setAmount(text.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1'))} />
          <TextInput style={styles.inputDescription}
            maxLength={50}
            placeholderTextColor={'grey'}
            placeholder='Description'
            cursorColor={'black'}
            value={description}
            onChangeText={text => setDescription(text)} />
          <FlatList
            data={CategoryData}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => [setCategory(item.id)]}>
                <View style={[styles.categoryContainer,
                (item.id == category) ? { backgroundColor: 'grey' } : { backgroundColor: 'white' }]}>
                  <Icon name={item.iconname} size={20} color={'blue'} />
                  <Text style={{ marginLeft: 5, color: 'black' }}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        <DatePicker
          modal
          mode='date'
          open={dateOpen}
          date={date}
          timeZoneOffsetInMinutes={0}
          onConfirm={(date) => {
            setDateOpen(!dateOpen)
            setDate(date)
            console.log(date)
          }}
          onCancel={() => {
            setDateOpen(!dateOpen)
          }}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={groupModalVisibility}
          onRequestClose={() => {
            setGroupModalVisibility(!groupModalVisibility)
          }}>
          <View style={styles.centeredViewModal}>
            <View style={styles.modalView}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                padding: 10,
                marginHorizontal: 5,
              }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => setGroupModalVisibility(!groupModalVisibility)}>
                  <Icon name="close" color={'blue'} size={30} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  data={groups}
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={item => item.gid}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => [setGroup(item), setGroupModalVisibility(!groupModalVisibility)]}>
                      <View style={[styles.memberListWrapper, (item == groupSelected) ? { backgroundColor: 'grey' } : { backgroundColor: 'white' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image source={{ uri: item.imageurl }} style={styles.memberListImage} />
                          <Text style={styles.memberListText}>
                            {item.gname}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.subContainer}>
          <Text style={styles.subText}>
            Paid By
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => setPaidModalVisibility(!paidModalVisibility)}>
              <View style={styles.iconButton2}>
                <Icon name='plus-box' size={30} color={Colors.black} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={selectedPaidByData}
          horizontal={false}
          scrollEnabled={false}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <View style={styles.selectedMemberWrapper}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: item.imageurl }} style={styles.selectedMemberImage} />
                <Text style={styles.selectedMemberText}>
                  {item.name}
                </Text>
              </View>
              <TextInput
                placeholder='0.00'
                editable={!paidEqual}
                style={{ color: 'black' }}
                maxLength={10}
                keyboardType='numeric'
                value={paidByAmount[item.uid]}
                onChangeText={text => { changePaidByAmount(item.uid, text) }} />
            </View>
          )} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={paidModalVisibility}
          onRequestClose={() => {
            setPaidModalVisibility(!paidModalVisibility);
          }}>
          <View style={styles.centeredViewModal}>
            <View style={styles.modalView}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: 10,
              }}>
                <View style={{ marginHorizontal: 10, alignItems: 'center', justifyContent: "center" }}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => { setPaidEqual(!paidEqual) }}>
                    {paidEqual ?
                      <Icon name='equal' size={30} color={'blue'} /> :
                      <Icon name='not-equal-variant' size={30} color={'blue'} />}
                  </TouchableOpacity>
                </View>
                <View style={{ marginHorizontal: 10, alignItems: 'center', justifyContent: "center" }}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setPaidModalVisibility(!paidModalVisibility)}>
                    <Icon name="close" color={'blue'} size={30} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  data={(groupSelected) ? members : friends}
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={item => item.uid}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => [addPaidByFriend(item)]}>
                      <View style={[styles.memberListWrapper, (paidBy.includes(item.uid)) ? { backgroundColor: 'grey' } : { backgroundColor: 'white' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image source={{ uri: item.imageurl }} style={styles.memberListImage} />
                          <Text style={styles.memberListText}>
                            {item.name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.subContainer}>
          <Text style={styles.subText}>
            Split Between
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => setSplitModalVisibility(!splitModalVisibility)}>
                <Icon name='plus-box' size={30} color={Colors.black} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <FlatList
          data={selectedSplitByData}
          horizontal={false}
          scrollEnabled={false}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <View style={styles.selectedMemberWrapper}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: item.imageurl }} style={styles.selectedMemberImage} />
                <Text style={styles.selectedMemberText}>
                  {item.name}
                </Text>
              </View>
              <TextInput
                placeholder='0.00'
                editable={!splitEqual}
                style={{ color: 'black' }}
                maxLength={10}
                keyboardType='numeric'
                value={splitByAmount[item.uid]}
                onChangeText={text => { changeSplitByAmount(item.uid, text) }} />
            </View>
          )}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={splitModalVisibility}
          onRequestClose={() => {
            setSplitModalVisibility(!splitModalVisibility);
          }}>
          <View style={styles.centeredViewModal}>
            <View style={styles.modalView}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                padding: 10,
              }}>
                {(groupSelected) ?
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => { selectAll() }}>
                    <Icon name="select-all" color={'blue'} size={30} />
                  </TouchableOpacity>
                  :
                  <View />
                }
                <View style={{ marginHorizontal: 10 }}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setSplitEqual(!splitEqual)}>
                    {splitEqual ?
                      <Icon name='equal' size={30} color={'blue'} /> :
                      <Icon name='not-equal-variant' size={30} color={'blue'} />}
                  </TouchableOpacity>
                </View>
                <View style={{ marginHorizontal: 10 }}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setSplitModalVisibility(!splitModalVisibility)}>
                    <Icon name="close" color={'blue'} size={30} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  data={(groupSelected) ? members : friends}
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={item => item.uid}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => addSplitByFriend(item)}>
                      <View style={[styles.memberListWrapper, (splitBy.includes(item.uid)) ? { backgroundColor: 'grey' } : { backgroundColor: 'white' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image source={{ uri: item.imageurl }} style={styles.memberListImage} />
                          <Text style={styles.memberListText}>
                            {item.name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView >
      <Snackbar
        elevation={10}
        duration={1200}
        visible={snackBarVisibility}
        wrapperStyle={{ marginBottom: 60 }}
        onDismiss={() => { setSnackBarVisibility(!snackBarVisibility) }}>
        {snackBarText}
      </Snackbar>
      <TouchableHighlight style={styles.saveButtonContainer}
        onPress={() => { expenseValidation(postID, amount, description, category, date, groupSelected, paidByAmount, splitByAmount, payeeAmount, transactionMembers, oweAmount) }}>
        {(saving) ?
          <ActivityIndicator color={'white'} /> :
          <View>
            <Text style={styles.saveButtonText}>
              SAVE EXPENSE
            </Text>
          </View>}
      </TouchableHighlight>
    </View >
  )
}


const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: "white",
  },
  headerBox: {
    alignItems: 'center',
    justifyContent: 'Center',
    padding: 12,
    backgroundColor: 'silver',
    margin: 15,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  inputAmount: {
    fontSize: 60,
    color: "black",
    borderRadius: 5,
    borderColor: 'grey',
    textAlign: 'center',
    alignSelf: 'center'
  },
  inputDescription: {
    margin: 10,
    paddingLeft: 10,
    width: '90%',
    borderBottomWidth: 1
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
  iconPanel: {
    padding: 10,
    borderRadius: 10,
    margin: 10,
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: 'lightgrey',
  },
  groupWrapper: {
    backgroundColor: Colors.bgColor,
    padding: 10,
    borderRadius: 10,
    margin: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  centeredViewModal: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    opacity: 1,
    backgroundColor: '#00000099'
  },
  modalView: {
    height: Dimensions.get('window').height / 1.5,
    width: Dimensions.get('window').width,
    backgroundColor: Colors.bgColor,
    borderTopStartRadius: 25,
    borderTopEndRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
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
  subContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  subText: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 5
  },
  selectedMemberWrapper: {
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "lightgray",
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectedMemberImage: {
    width: 40,
    height: 40,
    borderRadius: 40
  },
  selectedMemberText: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: 14,
    marginLeft: 10
  },
  memberListWrapper: {
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: Colors.white,
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  memberListImage: {
    width: 30,
    height: 30,
    borderRadius: 30
  },
  memberListText: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: 14,
    marginLeft: 10
  },
  saveButtonContainer: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: Colors.black
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
})