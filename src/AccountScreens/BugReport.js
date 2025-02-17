import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import Colors from '../../assets/colors/Colors';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';


export default BugReport = () => {
    const navigation = useNavigation()
    const [about, setAbout] = useState("");
    const [description, setDescription] = useState("");
    const [alert, setAlert] = useState("")

    const AddBugReport = (about, description) => {
        const usersCollection = firestore().collection("BugReports").doc();
        if (about.trim() == "" || description.trim() == "") {
            setAlert("Empty field present!")
        } else {
            usersCollection.set({
                "uid": auth().currentUser.uid,
                "About": about,
                "Description": description,
            })
            Keyboard.dismiss();
            setAlert("Submitted!");
            setDescription("");
            setAbout("");
            navigation.goBack();
        }

    }

    return (
        <View style={styles.container}>
            <View style={styles.AppBar}>
                <Text style={styles.AppBarText}>
                    Bugs or feedback
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <TextInput style={styles.descriptionBox}
                    placeholder='About'
                    value={about}
                    onChangeText={text => setAbout(text)}
                />
                <TextInput style={styles.descriptionBox}
                    multiline
                    numberOfLines={5}
                    placeholder='Description'
                    textAlignVertical='top'
                    value={description}
                    onChangeText={text => setDescription(text)}
                />
                <Text style={styles.alertText}>
                    {alert}
                </Text>
            </View>
            <TouchableOpacity onPress={() => AddBugReport(about, description)}>
                <View style={styles.buttonContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.buttonText}>
                            Submit
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

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
        height: 65,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 15,
    },
    AppBarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
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
    alertText: {
        color: Colors.black,
        alignSelf: 'flex-start',
        marginLeft: 10,
        fontSize: 12,
        color: Colors.red,
    }
})