import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Image,
    Alert,
    TouchableOpacity,
    Modal,
    TouchableHighlight,
    Dimensions,
    ActivityIndicator
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Colors from '../../assets/colors/Colors'
import { useNavigation } from '@react-navigation/native'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import CountryData from '../../assets/data/CountryData';
import messaging from '@react-native-firebase/messaging';
import userDataStore from '../../store';
import { ImageHolder } from '../_Components/ImageHolder'

export default Account = () => {
    const navigation = useNavigation();
    const userData = userDataStore((state) => state.userData)
    const [name, setName] = useState(userData["name"]);
    const [warningText, setWarningText] = useState("");

    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [numberModalVisible, setNumberModalVisible] = useState(false);

    const [numberVerify, setNumberVerify] = useState(false);

    const [confirm, setConfirm] = useState(null);

    // Verification code (OTP - One-Time-Passcode)
    const [code, setCode] = useState('');

    const [loading, setLoading] = useState(false);

    function validatePhoneNumber(phoneNumber) {
        const phonePattern = /^(?:\+?\d{1,3})?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})$/;
        console.log(phonePattern.test(phoneNumber))
        return phonePattern.test(phoneNumber);
    }

    const changePictureAlert = () => {
        Alert.alert('UPDATE IMAGE', 'Do you wat to update the image?',
            [
                {
                    text: 'CANCEL',
                    style: 'cancel',
                },
                {
                    text: 'CONFIRM',
                    onPress: () => { console.log('Change Image window') },
                    color: 'black'
                },
            ]
        );
    }

    const ChangeName = async (name) => {
        if (!name || name.trim() == "") {
            setWarningText("Empty Value")
        }
        else if (name.split(" ").length != 2) {
            setWarningText("First and last name please")
        }
        else if (name.trim() != "") {
            firestore().collection("Users").doc(auth().currentUser.uid).set({
                "name": name,
            }, { merge: true })
            setName("")
            setWarningText("")
            setNameModalVisible(!nameModalVisible)
        }
    }

    const SignOutAlert = () => {
        Alert.alert('SIGN OUT', 'Do you really want to sign out?',
            [
                {
                    text: 'CANCEL',
                    style: 'cancel',
                },
                {
                    text: 'SIGN OUT',
                    onPress: () => removeTokenAndSignOut(),
                    color: 'black'
                },
            ]
        );
    }

    async function removeTokenAndSignOut () {
        setLoading(true)
        // Assume user is already signed in
        const userId = auth().currentUser.uid;

        // Delete the token from device
        messaging().deleteToken()

        // Remove the token from the users datastore
        await firestore()
            .collection('Users')
            .doc(userId)
            .update({
                'token': firestore.FieldValue.delete(),
            });
        await auth().signOut();
        navigation.replace('SelectCountry');
    }

    return (
        <View style={styles.Container}>
            <View style={styles.insideContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, }}>
                    <Text style={styles.accountText}>
                        Account Info
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => navigation.navigate('AccountSettings')}>
                        <View>
                            <Icon name='settings' size={24} color={Colors.black} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {(userData.imageurl) ?
                        <TouchableOpacity onPress={() => changePictureAlert()}>
                            <View style={styles.profileContainer}>
                                <Image source={{ uri: userData.imageurl }}
                                    style={styles.profilePicture} />
                            </View>
                        </TouchableOpacity> : <ImageHolder text = {userData.name} size = {100} num={userData.imagenum}/>
                    }
                    <Text style={styles.basicInfoText}>
                        Basic Info
                    </Text>
                </View>
                <View style={styles.infoContainer}>
                    <View View style={{ width: '80%' }}>
                        <Text style={styles.mainText}>
                            Name
                        </Text>
                        <Text style={styles.subText} ellipsizeMode="tail" numberOfLines={1}>
                            {userData["name"]}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setNameModalVisible(!nameModalVisible)}>
                        <Icon name='edit' size={24} color={'black'} />
                    </TouchableOpacity>
                </View>
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={nameModalVisible}
                    onRequestClose={() => {
                        setNameModalVisible(!nameModalVisible);
                        setWarningText("")
                    }}>
                    <View style={styles.centeredViewModal}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalHeader}>
                                CHANGE NAME
                            </Text>
                            <TextInput style={styles.inputText}
                                maxLength={100}
                                placeholderTextColor={'grey'}
                                placeholder='Name'
                                value={name}
                                onChangeText={text => setName(text.replace(/[^a-zA-z ]/g, ''))}
                                cursorColor={'black'} />
                            <Text style={{ alignSelf: 'flex-end', marginEnd: 20, color: Colors.red }}>
                                {warningText}
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity underlayColor="royalblue"
                                    onPress={() => [setNameModalVisible(!nameModalVisible), setWarningText('')]}>
                                    <View style={styles.modalButton}>
                                        <Text style={styles.modalText}>Cancel</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity underlayColor="royalblue"
                                    onPress={() => ChangeName(name)}>
                                    <View style={styles.modalButton}>
                                        <Text style={styles.modalText}>Change</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <View style={styles.infoContainer}>
                    <View>
                        <Text style={styles.mainText}>
                            Phone Number
                        </Text>
                        <Text style={styles.subText}>
                            {userData["phoneno"]}
                        </Text>
                    </View>
                    {/* <TouchableOpacity
                        onPress={() => setNumberModalVisible(!numberModalVisible)}>
                        <Icon name='edit' size={24} color={'black'} />
                    </TouchableOpacity> */}
                </View>
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={numberModalVisible}
                    onRequestClose={() => {
                        setNumberModalVisible(!numberModalVisible);
                        setNumberVerify(false)
                        setWarningText("")
                    }}>
                    <View style={styles.centeredViewModal}>
                        {(numberVerify) ?
                            <View style={styles.modalView}>
                                <Text style={styles.modalHeader}>
                                    VERIFY NUMBER
                                </Text>
                                <TextInput style={styles.inputText}
                                    maxLength={100}
                                    placeholderTextColor={'grey'}
                                    placeholder='Verification Code'
                                    value={name}
                                    onChangeText={text => setName(text.replace(/[^a-zA-z ]/g, ''))}
                                    cursorColor={'black'} />
                                <Text style={{ alignSelf: 'flex-end', marginEnd: 20, color: Colors.red }}>
                                    {warningText}
                                </Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity underlayColor="royalblue"
                                        onPress={() => setNumberVerify(!numberVerify)}>
                                        <View style={styles.modalButton}>
                                            <Text style={styles.modalText}>Back</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity underlayColor="royalblue"
                                        onPress={() => { }}>
                                        <View style={styles.modalButton}>
                                            <Text style={styles.modalText}>Verify</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            :
                            <View style={styles.modalView}>
                                <Text style={styles.modalHeader}>
                                    CHANGE PHONE NUMBER
                                </Text>
                                <TextInput style={styles.inputText}
                                    maxLength={100}
                                    placeholderTextColor={'grey'}
                                    placeholder='Phone Number'
                                    value={name}
                                    onChangeText={text => setName(text.replace(/[^a-zA-z ]/g, ''))}
                                    cursorColor={'black'} />
                                <Text style={{ alignSelf: 'flex-end', marginEnd: 20, color: Colors.red }}>
                                    {warningText}
                                </Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity underlayColor="royalblue"
                                        onPress={() => [setNumberModalVisible(!numberModalVisible), setWarningText('')]}>
                                        <View style={styles.modalButton}>
                                            <Text style={styles.modalText}>Cancel</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity underlayColor="royalblue"
                                        onPress={() => setNumberVerify(!numberVerify)}>
                                        <View style={styles.modalButton}>
                                            <Text style={styles.modalText}>Change</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>}
                    </View>
                </Modal>
                <View style={{
                    backgroundColor: Colors.bgColor,
                    padding: 15,
                    borderRadius: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10
                }}>
                    <Text>{userData["country"]}</Text>
                    <Text>{(userData["country"]) ? CountryData[userData["country"]]['currency'] : ''}</Text>
                </View>
            </View>
            {loading ?
                <View style={styles.buttonContainer}>
                    <ActivityIndicator color={'white'} />
                </View> :
                <TouchableHighlight style={styles.buttonContainer} onPress={() => SignOutAlert()}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name='logout' size={24} color={'white'} />
                        <Text style={styles.buttonText}>
                            Sign Out
                        </Text>
                    </View>
                </TouchableHighlight>}
        </View >
    )
}

const styles = StyleSheet.create({
    Container: {
        height: '100%',
        width: '100%',
        backgroundColor: Colors.white,
    },
    insideContainer: {
        backgroundColor: Colors.white,
        flex: 1,
        marginHorizontal: 10,
        marginTop: 30
    },
    accountText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePicture: {
        height: 100,
        width: 100,
        borderRadius: 100,
        marginRight: 10
    },
    basicInfoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        margin: 10,
        alignSelf: 'center'
    },
    infoContainer: {
        marginVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: 'grey',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
        flexWrap: 'wrap'
    },
    mainText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    subText: {
        fontSize: 16,
        color: Colors.darkGrey,
        marginVertical: 10,
    },
    inputText: {
        margin: 5,
        paddingLeft: 10,
        width: '90%',
        borderBottomWidth: 1
    },
    buttonContainer: {
        padding: 12,
        alignItems: 'center',
        borderRadius: 5,
        marginHorizontal: 10,
        marginVertical: 10,
        backgroundColor: Colors.black
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 10
    },
    centeredViewModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 1,
        backgroundColor: '#00000099'
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
        paddingHorizontal: 30,
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

