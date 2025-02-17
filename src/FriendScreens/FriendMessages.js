import { React, useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    FlatList,
    ActivityIndicator,
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import CategoryData from '../../assets/data/CategoryData';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FAB } from 'react-native-paper';
import DateString from '../_Components/DateString';
import userDataStore from '../../store';
import { ImageHolder } from '../_Components/ImageHolder';

export default FriendMessages = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const uId = route.params.uid;
    const name = route.params.name;
    const imageurl = route.params.imageurl;
    const friendIDs = route.params.friendIDs;
    const currency = route.params.currency;
    const random = route.params.random

    const [hideSettled, setHideSettled] = useState(false);

    const [loading, setLoading] = useState(true);
    const [balanceAmount, setBalanceAmount] = useState();

    const [payer, setPayer] = useState()
    const [reciever, setReciever] = useState()

    const getTransactionFriend = userDataStore((state) => state.getTransactionFriend)
    const transactions = userDataStore((state) => state.transactionsFriend)
    const updateBalanceAmountLive = userDataStore((state) => state.updateBalanceAmountLive)

    const user = (userId) => {
        if (userId == auth().currentUser.uid) {
            return 'you'
        }
        else {
            return name.split(" ")[0]
        }
    }

    const balance = (map) => {
        const currentUserId = auth().currentUser.uid;

        if (map?.[currentUserId]?.[uId] !== undefined) {
            return map[currentUserId][uId];
        } else if (map?.[uId]?.[currentUserId] !== undefined) {
            return map[uId][currentUserId];
        } else {
            return 0; // Or handle the missing key appropriately
        }
    }

    useEffect(() => {
        const unsubscribe = firestore().collection("Users").doc(auth().currentUser.uid)
            .collection("Friends")
            .doc(uId)
            .onSnapshot(documentSnapshot => {
                if (documentSnapshot && documentSnapshot.data()) {
                    if (documentSnapshot.data().balanceAmount == 0) {
                        setHideSettled(true)
                    } else {
                        setHideSettled(false)
                    }

                    if (documentSnapshot.data().balanceAmount < 0) {
                        setPayer(auth().currentUser.uid)
                        setReciever(uId)
                    }
                    else {
                        setPayer(uId)
                        setReciever(auth().currentUser.uid)
                    }
                    setBalanceAmount(documentSnapshot.data().balanceAmount)
                    updateBalanceAmountLive(uId, documentSnapshot.data().balanceAmount)
                    getTransactionFriend(uId, documentSnapshot.data().transactions)
                }
                setLoading(false)
            });

        return () => unsubscribe();
    }, [uId]);

    return (
        <View style={styles.container}>
            <View style={styles.AppBar}>
                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
                    {imageurl ?
                        <Image source={{ uri: imageurl }}
                            style={styles.profilePicture} /> :
                        <ImageHolder text={name} size={40} />
                    }
                    <Text style={styles.AppBarText} ellipsizeMode="tail" numberOfLines={1} >
                        {name}
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => navigation.navigate('FriendSetting', { uId: uId, balanceAmount: balanceAmount })}>
                    <View style={styles.iconButton}>
                        <Icon name='cog' size={24} color={Colors.black} />
                    </View>
                </TouchableOpacity>
            </View>
            {(balanceAmount) ?
                <View style={styles.settleBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{
                            color: 'black',
                            fontWeight: '400',
                            fontSize: 14,
                        }}>
                            {(balanceAmount < 0) ? 'You owe : ' : 'Owes you : '}
                        </Text>
                        <Text style={{
                            color: (balanceAmount >= 0) ? Colors.green : Colors.red,
                            fontWeight: '400',
                            fontSize: 14,
                        }}>
                            {currency}
                            {Math.abs(balanceAmount)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => { navigation.navigate('SettleExpense', { uId: uId, balanceAmount: balanceAmount, payer: payer, reciever: reciever }) }}>
                        <Text style={{ color: 'blue', fontWeight: 'bold', }}>
                            Settle Up
                        </Text>
                    </TouchableOpacity>
                </View> :
                <View />
            }

            {loading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
                : (transactions.length == 0) ?
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={SettleImageData[random]} style={{ height: 125, width: 125 }} />
                        <Text>
                            No transactions yet.
                        </Text>
                    </View>
                    : (hideSettled == true) ?
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={SettleImageData[random]} style={{ height: 125, width: 125 }} />
                            <Text>
                                All settled up.
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => setHideSettled(false)}>
                                <View style={styles.iconButton}>
                                    <Icon2 name='add-circle' size={24} color={Colors.black} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        :
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <FlatList
                                data={transactions}
                                horizontal={false}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={item => item.tid}
                                renderItem={({ item }) => (
                                    (item.type === 'Settlement Expense') ?
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={() => navigation.navigate('ExpenseDetails', { eData: item, currency: currency, random: Math.floor(Math.random() * 9), name: name.split(" ")[0] })}>
                                            <View style={styles.friendContainer}>
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Text>{user(item.members[0])} paid {user(item.members[1])} {currency}{(item.amount)}</Text>
                                                    <Icon2 name='payments' size={24} color={Colors.green} />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={() => navigation.navigate('ExpenseDetails', { eData: item, currency: currency })}>
                                            <View style={styles.friendContainer}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <View style={styles.friendDataWrapper}>
                                                        <View style={styles.friendRow}>
                                                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={styles.friendName}>
                                                                    {DateString(item.date).split(" ")[1]}
                                                                </Text>
                                                                <Text style={{ fontWeight: 'bold' }}>
                                                                    {DateString(item.date).split(" ")[2]}
                                                                </Text>
                                                            </View>
                                                            <View style={{ width: '5%' }}>
                                                                <Icon name={CategoryData[item.category]['iconname']} size={20} color={'blue'} />
                                                            </View>
                                                            <View style={{ width: '35%' }}>
                                                                <Text style={styles.friendName}
                                                                    ellipsizeMode="tail"
                                                                    numberOfLines={1}>
                                                                    {item.description}
                                                                </Text>
                                                                <Text>
                                                                    {item.type}
                                                                </Text>
                                                            </View>
                                                            <View style={{ width: '25%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                                {(balance(item.payees)) ?
                                                                    <Text style={{
                                                                        fontWeight: 'bold',
                                                                        fontSize: 14,
                                                                        color: ((balance(item.payees)) >= 0) ? Colors.green : Colors.red,
                                                                    }}>
                                                                        {(balance(item.payees) >= 0) ? '+ ' : '- '}
                                                                        {currency}
                                                                        {balance(item.payees)}
                                                                    </Text>
                                                                    :
                                                                    <Text style={{
                                                                        fontWeight: 'bold',
                                                                        fontSize: 14,
                                                                        color: Colors.black,
                                                                    }}>
                                                                        nil
                                                                    </Text>
                                                                }
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                )}
                            />
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text>
                                    ----------------------------------- End -----------------------------------
                                </Text>
                            </View>
                        </ScrollView>
            }
            <FAB
                icon={'plus'}
                extended={false}
                onPress={() => { navigation.navigate('AddExpense', { uId: uId, friendIDs: friendIDs }) }}
                visible={true}
                style={styles.fab}
                color='white'
                backgroundColor='royalblue'
            />
        </View>
    )
}




const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: Colors.shade1

    },
    AppBar: {
        backgroundColor: Colors.white,
        alignItems: 'center',
        height: 65,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    AppBarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    iconButton: {
        backgroundColor: "transparent",
        padding: 10,
        marginHorizontal: 5,
    },
    profilePicture: {
        height: 40,
        width: 40,
        borderRadius: 40,
        marginHorizontal: 5
    },
    settleBox: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 10
    },
    friendContainer: {
        marginVertical: 5,
        marginHorizontal: 5,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    friendDataWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    friendImage: {
        width: 40,
        height: 40,
        borderRadius: 60
    },
    friendName: {
        fontWeight: 'bold',
        color: Colors.black,
        fontSize: 14,
    },
    friendRow: {
        paddingHorizontal: 5,
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    fab: {
        bottom: 16,
        right: 16,
        position: 'absolute',
        borderRadius: 50,
    },
})