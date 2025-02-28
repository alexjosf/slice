import React, { useState, useEffect } from 'react'
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableHighlight,
    ActivityIndicator
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Snackbar } from 'react-native-paper';

// Default function that exported
export default function LogIn() {
    const navigation = useNavigation();
    const route = useRoute();

    // Dial code of the country selected
    const dialCode = route.params.dialCode;
    // The country selected
    const country = route.params.country;
    // The phone number
    const [phoneNumber, setPhoneNumber] = useState("");
    // Snackbar text
    const [snackBarText, setSnackBarText] = useState("");
    // Snackbar display status
    const [snackBarVisibility, setSnackBarVisibility] = useState(false);

    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);

    // Verification code (OTP - One-Time-Passcode)
    const [code, setCode] = useState('');

    const [loading, setLoading] = useState(false);

    function validatePhoneNumber(phoneNumber) {
        const phonePattern = /^(?:\+?\d{1,3})?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})$/;
        console.log(phonePattern.test(phoneNumber))
        return phonePattern.test(phoneNumber);
    }

    const PhoneSignIn = async (phoneNumber) => {
        if (!validatePhoneNumber(phoneNumber)) {
            setSnackBarText('Enter valid phone number')
            setSnackBarVisibility(!snackBarVisibility)
        } else {
            const confirmation = await auth().signInWithPhoneNumber(phoneNumber.replace(/[ \-\(\)\.]/g, ""));
            setConfirm(confirmation);
        }
    }

    async function confirmCode() {
        setLoading(!loading)
        //Confirm the verification code
        await confirm.confirm(code).then((response) => {
            //If new user, create database and add country
            if (response.additionalUserInfo.isNewUser) {
                firestore().collection("Users").doc(auth().currentUser.uid)
                    .set({
                        "country": country
                    }, { merge: true })
            }
        }
        ).catch((error) => {
            if (error.code === 'auth/invalid-verification-code') {
                setSnackBarText('Entered incorrect code')
                setSnackBarVisibility(!snackBarVisibility)
            }
            setLoading(false)
        })
    }

    // If the credentials are correct, change the screen to home.
    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged((user) => {
            if (user) {
                if (user.displayName) {
                    navigation.replace('BottomNav');
                }
                else {
                    navigation.replace('Register', { dialCode: dialCode, country: country, phoneNo: phoneNumber });
                }
            }
        })

        return () => unsubscribe();
    }, [])


    return (
        <View style={styles.container}>
            {(!confirm) ?
                <View style={[styles.container, { padding: 20 }]}>
                    <Text style={styles.mainText}>
                        LogIn or SignUp
                    </Text>
                    <View style={{ marginTop: 25 }} />
                    <View style={{ flexDirection: 'row' }}>
                        <TextInput style={styles.dialCodeInput}
                            value={dialCode}
                            editable={false} />
                        <TextInput style={styles.numberInput}
                            placeholder='Phone Number'
                            value={phoneNumber}
                            onChangeText={text => setPhoneNumber(text)} />
                    </View>
                    <View style={{ height: 20 }} />
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableHighlight style={styles.buttonContainer} underlayColor="white"
                            onPress={() => PhoneSignIn(dialCode + phoneNumber)}>
                            <Text style={styles.buttonText}>
                                GET OTP
                            </Text>
                        </TouchableHighlight>
                    </View>
                </View>
                :
                <View style={[styles.container, { padding: 20 }]}>
                    <Text style={styles.mainText}>
                        Verify Number
                    </Text>
                    <View style={{ marginTop: 25 }} />
                    <View style={{ flexDirection: 'row' }}>
                        <TextInput style={styles.numberInput}
                            placeholder='Verification Code'
                            value={code}
                            onChangeText={text => setCode(text)} />
                    </View>
                    <View style={{ height: 20 }} />
                    <View style={{ flexDirection: 'row' }}>
                        {loading ?
                            <View style={styles.buttonContainer}>
                                <ActivityIndicator color={'white'} />
                            </View> :
                            <TouchableHighlight style={styles.buttonContainer} underlayColor="white"
                                onPress={() => confirmCode()}>
                                <Text style={styles.buttonText}>
                                    CONFIRM
                                </Text>
                            </TouchableHighlight>
                        }
                    </View>
                </View>
            }
            <Snackbar
                elevation={10}
                duration={1200}
                visible={snackBarVisibility}
                onDismiss={() => { setSnackBarVisibility(!snackBarVisibility) }}>
                {snackBarText}
            </Snackbar>
        </View >
    )
}


const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        alignItems: 'center',
        paddingVertical: 50
    },
    mainText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    dialCodeInput: {
        backgroundColor: 'lightgrey',
        paddingHorizontal: 10,
        color: Colors.black,
        marginRight: 10,
        borderRadius: 5,
    },
    numberInput: {
        backgroundColor: 'lightgrey',
        paddingHorizontal: 10,
        flexGrow: 1,
        borderRadius: 5,
        flexDirection: 'row'
    },
    buttonContainer: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        backgroundColor: Colors.black,
        flexDirection: 'row',
        flexGrow: 1
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    }
})