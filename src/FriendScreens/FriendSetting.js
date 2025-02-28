import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    FlatList,
    Image
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import auth from '@react-native-firebase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { Snackbar } from 'react-native-paper';
import userDataStore from '../../store';
import { ImageHolderGroup } from '../_Components/ImageHolderGroup';

export default FriendSetting = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const uId = route.params.uId;
    const balanceAmount = route.params.balanceAmount;

    const [Groups, setGroups] = useState([]);
    const [snackBarVisibility, setSnackBarVisibility] = useState(false)
    const groupData = userDataStore((state) => state.groupDetails)

    useEffect(() => {
        let temp = []
        Object.values(groupData).forEach(
            (document) => {
                if ((document.members).includes(uId)) {
                    temp.push(document)
                }
            }
        )
        setGroups(temp)
    }, [])

    const unFriendAlert = (uId, balanceAmount) => {
        Alert.alert('UNFRIEND', 'Do you really want to unfriend?',
            [
                {
                    text: 'CANCEL',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'UNFRIEND',
                    onPress: () => { unFriend(uId, balanceAmount) },
                    color: 'black'
                },
            ]
        );
    }

    const unFriend = (uId, balanceAmount) => {
        if (balanceAmount > 0 || balanceAmount < 0) {
            setSnackBarVisibility(!snackBarVisibility)
        }
        else {
            firestore().collection("Users").doc(auth().currentUser.uid).collection('Friends')
                .doc(uId)
                .delete()
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.appBar}>
                <Text style={styles.appBarText}>
                    FriendSetting
                </Text>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => [unFriendAlert(uId, balanceAmount)]}>
                    <View style={styles.iconButton}>
                        <Icon name='heart-minus-outline' size={24} color={Colors.red} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.commonContainer}>
                <Text style={styles.commonText}>
                    Common Groups
                </Text>
            </View>
            <FlatList
                data={Groups}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.gid}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => navigation.navigate('GroupMessages', { gData: item })}>
                        <View style={[styles.groupListWrapper]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {(item.imageurl) ?
                                    <Image source={{ uri: item.imageurl }} style={styles.groupListImage} />
                                    :
                                    <ImageHolderGroup emoji={item.emoji} size={30} num={item.imagenum} />
                                }
                                <Text style={styles.groupListText}>
                                    {item.gname}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
            <Snackbar
                elevation={10}
                duration={1200}
                visible={snackBarVisibility}
                onDismiss={() => { setSnackBarVisibility(!snackBarVisibility) }}>
                Pending amount needs to be settled
            </Snackbar>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: Colors.shade1,
        paddingBottom: 10
    },
    appBar: {
        backgroundColor: Colors.white,
        height: 'auto',
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 5,
        paddingLeft: 15,
        elevation: 5,
        marginBottom: 10
    },
    appBarText: {
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
    commonContainer: {
        borderBottomWidth: 0.5,
        borderBottomColor: 'grey',
        paddingRight: 10,
        marginHorizontal: 10,
        marginBottom: 10
    },
    commonText: {
        fontSize: 16,
        color: Colors.black,
        marginBottom: 5
    },
    groupListWrapper: {
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
    groupListImage: {
        width: 30,
        height: 30,
        borderRadius: 30
    },
    groupListText: {
        fontWeight: 'bold',
        color: Colors.black,
        fontSize: 14,
        marginLeft: 10
    },
})