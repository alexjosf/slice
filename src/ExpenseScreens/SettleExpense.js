import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DatePicker from 'react-native-date-picker'
import { Snackbar } from 'react-native-paper';
import uuid from 'react-native-uuid';
import CountryData from '../../assets/data/CountryData';
import axios from 'axios';
import { ImageHolder } from '../_Components/ImageHolder';


export default function SettleExpense() {
    const navigation = useNavigation();
    const route = useRoute();
    const balanceAmount = route.params.balanceAmount;
    const payerData = route.params.payer;
    const recieverData = route.params.reciever;

    const postID = "s-" + uuid.v4()
    const [amount, setAmount] = useState(String(Math.abs(balanceAmount)))
    const [dateOpen, setDateOpen] = useState(false)
    const [date, setDate] = useState(new Date())
    const payerBalance = -Math.abs(balanceAmount)
    const recieverBalance = Math.abs(balanceAmount)

    const [snackBarText, setSnackBarText] = useState("")
    const [snackBarVisibility, setSnackBarVisibility] = useState(false)

    const [saving, setSaving] = useState(false)
    const [bankTransfer, setBankTransfer] = useState(true)

    const firstName = (text) => {
        return text.split(' ')[0]
    }

    const addTransaction = (payer, reciever, amount, payerBalance, recieverBalance, date, postID, bankTransfer) => {
        if (Math.abs(recieverBalance) < Number(amount)) {
            setSnackBarText("Entered amount exceed owed amound")
            setSnackBarVisibility(!snackBarVisibility)
        }
        else {
            setData()
            async function setData() {
                let transfer = ''
                if (bankTransfer) {
                    transfer = 'Paid via online transfer'
                } else {
                    transfer = 'Paid in cash'
                }
                var batch = firestore().batch();
                
                setSaving(!saving)
                let transaction = {
                    "tid": postID,
                    "uid": auth().currentUser.uid,
                    "amount": +parseFloat(amount).toFixed(2),
                    "date": firestore.Timestamp.fromDate(date),
                    "transfer": transfer,
                    "type": 'Settlement Expense',
                    "members": [payer['uid'], reciever['uid']]
                }
                batch.set(firestore().collection("Transactions").doc(postID), transaction, { merge: true })

                batch.set(firestore().collection("Users").doc(reciever['uid']).collection("Friends").doc(payer['uid']),
                    {
                        balanceAmount: +parseFloat(-payerBalance - parseFloat(amount)).toFixed(2),
                        transactions: { [postID]: amount }
                    }, { merge: true })
                batch.set(firestore().collection("Users").doc(payer['uid'])
                    .collection("Friends")
                    .doc(reciever['uid'])
                    , {
                        balanceAmount: +parseFloat(-recieverBalance + parseFloat(amount)).toFixed(2),
                        transactions: { [postID]: amount }
                    }, { merge: true })

                await batch.commit()

                sendPushNotificationSettlement(CountryData[payerData.country]['currency'], amount, payerData.name, payerData.token)
                sendPushNotificationSettlement(CountryData[recieverData.country]['currency'], amount, payerData.name, recieverData.token)
                navigation.goBack()
            }
        }

    }

    const sendPushNotificationSettlement = (currency, amount, user, token) => {
        if (token) {
            axios.post('https://orange-slice-server.onrender.com/addSettlement',
                {
                    currency: currency,
                    amount: amount,
                    user: user,
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
            <View style={styles.appBar}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => navigation.goBack()}>
                    <Icon name='close' size={24} color={Colors.black} />
                </TouchableOpacity>
                <Text>Settle Up</Text>

                {(saving) ?
                    <ActivityIndicator size="small" color={Colors.black} />
                    :
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => { addTransaction(payerData, recieverData, amount, payerBalance, recieverBalance, date, postID, bankTransfer) }}>
                        <Icon name='check' size={24} color={Colors.black} />
                    </TouchableOpacity>
                }
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
                    {(payerData.imageurl) ?
                        <Image source={{ uri: payerData.imageurl }} style={styles.profilePicture} />
                        : (payerData.name) && <ImageHolder text={payerData.name} size={50} num={payerData.imagenum} />
                    }
                    <View style={{ margin: 10 }}>
                        <Icon name='arrow-right-thin' size={24} color={Colors.black} />
                    </View>
                    {(recieverData.imageurl) ?
                        <Image source={{ uri: recieverData.imageurl }} style={styles.profilePicture} />
                        : (recieverData.name) && <ImageHolder text={recieverData.name} size={50} num={recieverData.imagenum} />
                    }
                </View>
                <Text>{(payerData['name']) && firstName(payerData.name)} is paying {(recieverData['name']) && firstName(recieverData.name)}</Text>
                <TextInput style={styles.inputAmount}
                    maxLength={10}
                    keyboardType="numeric"
                    placeholder='00.00'
                    numberOfLines={1}
                    value={amount}
                    onChangeText={text => setAmount(text.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1'))} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={(!bankTransfer) ? { color: Colors.blue2 } : { color: Colors.black }}>
                        Cash
                    </Text>
                    <TouchableOpacity onPress={() => setBankTransfer(!bankTransfer)}>
                        <View style={{
                            margin: 10,
                            alignItems: "center",
                            justifyContent: 'center',
                        }}>
                            {
                                (bankTransfer) ?
                                    <Icon name='toggle-switch' size={40} color={Colors.black} />
                                    :
                                    <Icon name='toggle-switch-off' size={40} color={Colors.black} />
                            }
                        </View>
                    </TouchableOpacity>
                    <Text style={(bankTransfer) ? { color: Colors.blue2 } : { color: Colors.black }}>
                        Bank
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => set}>
                    <View style={styles.iconPanel}>
                        <View style={{ flexDirection: 'row', alignItems: "center", }}>
                            <Icon name='calendar-edit' size={24} color={Colors.black} />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <Snackbar
                elevation={10}
                duration={1200}
                visible={snackBarVisibility}
                onDismiss={() => { setSnackBarVisibility(!snackBarVisibility) }}>
                {snackBarText}
            </Snackbar>
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
        </View >
    )
}

const styles = StyleSheet.create({
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    profilePicture: {
        height: 50,
        width: 50,
        borderRadius: 100,
        marginHorizontal: 5
    },
    inputAmount: {
        fontSize: 60,
        color: "black",
        borderRadius: 5,
        borderColor: 'grey',
        textAlign: 'center',
        alignSelf: 'center'
    },
    iconPanel: {
        margin: 10,
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: 'lightgrey',
    },
})