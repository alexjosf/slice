import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, TextInput, TouchableHighlight, Keyboard } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


export default NewGroup = () => {
    const navigation = useNavigation();
    const [groupName, setGroupName] = useState("");
    const [alert, setAlert] = useState("");
    const gid = "G" + new Date().getTime() +"-"+ auth().currentUser.uid;

    const AddNewGroup = (groupName) => {
        const groupsCollection = firestore().collection("Groups").doc(gid);
        const usersCollection = firestore().collection("Users").doc(auth().currentUser.uid)
        if (groupName.trim() == "") {
            setAlert("Empty field");
            console.log(gid);
        }
        else {
            groupsCollection.set({
                "gname": groupName,
                "gid": gid,
                'transactions': [],
                "imageurl": "https://i.pinimg.com/564x/a6/be/9c/a6be9ced2fd7a0884518e3535ff0bce8.jpg",
                "members": [auth().currentUser.uid]
            })
            
            usersCollection.set({
                "groups": firestore.FieldValue.arrayUnion(gid),
            }, { merge: true });

            Keyboard.dismiss();
            setAlert("Group Created");
            navigation.goBack();
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>
                    Create a new Group
                </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
                <Image source={require('../../assets/images/addGroupImage.png')}
                    style={styles.groupImage} />
                <TextInput style={styles.groupName}
                    placeholder='Enter group Name'
                    value={groupName}
                    onChangeText={(value) => setGroupName(value)} />
                <Text style={styles.alertText}>
                    {alert}
                </Text>
                <TouchableHighlight style={styles.buttonContainer} underlayColor="white"
                    onPress={() => [AddNewGroup(groupName)]}>
                    <Text style={styles.buttonText}>
                        CREATE GROUP
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
        backgroundColor: "white",
    },
    headerBox: {
        backgroundColor: 'silver',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 15,
        margin: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    groupImage: {
        height: 150,
        width: 150,
        borderRadius: 5,
        marginVertical: 30,
        alignSelf: 'center'
    },
    groupName: {
        marginTop: 10,
        backgroundColor: "lightgrey",
        paddingLeft: 10,
        width: '90%',
        borderRadius: 5,
    },
    buttonContainer: {
        backgroundColor: Colors.black,
        width: '90%',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        borderRadius: 5,
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
        color: "red",
    }
})