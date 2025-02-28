import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    FlatList,
    Image,
    ScrollView,
    ActivityIndicator
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Snackbar } from 'react-native-paper';
import { ImageHolder } from '../_Components/ImageHolder';

const GroupSetting = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const gId = route.params.gId;

    const [memberData, setMemberData] = useState();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [memberNum, setMemberNum] = useState('');

    const [snackBarVisibility, setSnackBarVisibility] = useState(false)

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            const usersCollection = firestore().collection("Groups").doc(gId)
            usersCollection.onSnapshot(documentSnapshot => {
                if (documentSnapshot != null) {
                    if (documentSnapshot.data()) {
                        setMembers(documentSnapshot.data().members)
                        getMembers(documentSnapshot.data().members)
                    }
                }
            })

        }

        return () => { isMounted = false; };
    }, [])

    async function getMembers(groupIDS) {
        setMemberNum(groupIDS.length)
        let members = groupIDS.filter(item => item !== auth().currentUser.uid)

        let temp = []
        members.forEach((item) => {
            firestore().collection("Users").doc(item).get().then((document) => {
                if (document) {
                    temp.push(document.data())
                }
            })
        })
        setMemberData(temp)
        setLoading(false)

    }

    const removeMemberAlert = (gid, uid) => {
        Alert.alert('REMOVE MEMBER', 'Do you really want to remove this member?',
            [
                {
                    text: 'CANCEL',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'REMOVE',
                    onPress: () => { removeMember(gid, uid) },
                    color: 'black'
                },
            ]
        );
    }


    async function removeMember(gid, uid) {
        await firestore().collection("Groups").doc(gid).set({
            "members": firestore.FieldValue.arrayRemove(uid),
        }, { merge: true });
        await firestore().collection("Users").doc(uid).set({
            "groups": firestore.FieldValue.arrayRemove(gid),
        }, { merge: true });
    }

    const exitGroupAlert = (gid) => {
        Alert.alert('EXIT GROUP', 'Do you really want to exit this group?',
            [
                {
                    text: 'CANCEL',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'EXIT',
                    onPress: () => [exitGroup(gid)],
                    color: 'black'
                },
            ]
        );
    }

    const exitGroup = async (gid) => {
        if (memberNum != 1) {
            await firestore().collection("Groups").doc(gid).update({
                "members": firestore.FieldValue.arrayRemove(auth().currentUser.uid)
            });
            await firestore().collection("Users").doc(auth().currentUser.uid).set({
                "groups": firestore.FieldValue.arrayRemove(gid),
            }, { merge: true });
            navigation.goBack()
        }
        else {
            setSnackBarVisibility(!snackBarVisibility)
        }
    }

    const deleteGroupAlert = (gid, members) => {
        Alert.alert('DELETE GROUP', 'Do you really want to delete this group?',
            [
                {
                    text: 'CANCEL',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'DELETE',
                    onPress: () => deleteGroup(gid, members),
                    color: 'black'
                },
            ]
        );
    }

    const deleteGroup = async (gid, members) => {
        for (i in members) {
            await firestore().collection("Users").doc(members[i]).set({
                "groups": firestore.FieldValue.arrayRemove(gid),
            }, { merge: true });
            navigation.goBack()
        }
        await firestore().collection("Groups").doc(gid).delete();
        navigation.pop(2);
    }


    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>
                    GroupSetting
                </Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => deleteGroupAlert(gId, members)}>
                        <View style={styles.iconButton}>
                            <Icon name='delete' size={24} color={Colors.red} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => exitGroupAlert(gId)}>
                        <View style={styles.iconButton}>
                            <Icon name='logout' size={24} color={Colors.red} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.subContainer}>
                <Text style={styles.subText}>
                    Members
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text>
                        {memberNum}/25
                    </Text>
                    <View style={styles.iconButton2}>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => [navigation.navigate('AddMemberGroup', { gId: gId })]}>
                            <Icon name='add-box' size={24} color={Colors.green} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {loading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
                :
                <ScrollView>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={memberData}
                            keyExtractor={item => item.uid}
                            horizontal={false}
                            scrollEnabled={false}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => {
                                return (
                                    <View style={styles.memberListWrapper}>
                                        <View style={styles.memberDataWrapper}>
                                            {item.imageurl ?
                                                <Image source={{ uri: item.imageurl }} style={styles.memberListImage} />
                                                :
                                                <ImageHolder text={item.name} size={30} />
                                            }
                                            <Text style={styles.memberListName}>
                                                {item.name}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={() => removeMemberAlert(gId, item.uid)}>
                                            <View>
                                                <Icon name='person-remove' size={24} color={Colors.red} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            }}
                        />
                    </View>
                </ScrollView>
            }
            <Snackbar
                elevation={10}
                duration={1200}
                visible={snackBarVisibility}
                onDismiss={() => { setSnackBarVisibility(!snackBarVisibility) }}>
                You are the last member. Delete group instead.
            </Snackbar>
        </View>
    )
}

export default GroupSetting


const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: Colors.shade1,
        paddingBottom: 20
    },
    headerBox: {
        backgroundColor: Colors.white,
        height: 'auto',
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 5,
        paddingLeft: 15,
        elevation: 5,
        marginBottom: 5
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    iconButton: {
        backgroundColor: Colors.white,
        padding: 10,
        marginVertical: 10,
        marginHorizontal: 5,
        padding: 10,
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
    iconButton2: {
        backgroundColor: Colors.shade1,
        padding: 10,
        marginHorizontal: 5,
        padding: 5,
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