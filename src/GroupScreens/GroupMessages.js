import { React, useState, useEffect, useCallback } from 'react'
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
import { useNavigation, useRoute } from '@react-navigation/native';
import CategoryData from '../../assets/data/CategoryData';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FAB } from 'react-native-paper';
import DateString from '../_Components/DateString';
import userDataStore from '../../store';
import { ImageHolderGroup } from '../_Components/ImageHolderGroup';


export default GroupMessages = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const gData = route.params.gData
    const gId = route.params.gId
    const random = route.params.random

    const [loading, setLoading] = useState(true);

    const userCountry = userDataStore((state) => state.userCountry)
    const transactions = userDataStore((state) => state.transactionsGroup)
    const getTransactionGroup = userDataStore((state) => state.getTransactionGroup)

    useEffect(() => {
        const unsubscribe = firestore().collection("Groups").doc(gId).onSnapshot(documentSnapshot => {
            if (documentSnapshot && documentSnapshot.data()) {
                getTransactionGroup(gId, documentSnapshot.data().transactions)
            }
            setLoading(false)
        })

        return () => unsubscribe();
    }, [gId]);

    return (
        <View style={styles.container}>
            <View style={styles.AppBar}>
                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
                    {(gData.imageurl) ?
                        <Image source={{ uri: gData.imageurl }} style={styles.profilePicture} />
                        :
                        <ImageHolderGroup emoji={gData.emoji} size={40} num={gData.imagenum} />
                    }
                    <Text style={styles.AppBarText} ellipsizeMode="tail" numberOfLines={1} >
                        {gData.gname}
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => navigation.navigate('GroupSetting', { gId: gId })}>
                    <View style={styles.iconButton}>
                        <Icon name='cog' size={24} color={Colors.black} />
                    </View>
                </TouchableOpacity>
            </View>
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
                    :
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <FlatList
                            data={transactions}
                            horizontal={false}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={item => item.tid}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={() => navigation.navigate('ExpenseDetails', { eData: item, currency: CountryData[userCountry]['currency'] })}>
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
                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            fontSize: 14,
                                                            color: (item.amount[auth().currentUser.uid] >= 0) ? Colors.green : Colors.red,
                                                        }}>
                                                            {(item.amount[auth().currentUser.uid] >= 0) ? '+ ' : '- '}
                                                            {CountryData[userCountry]['currency']}
                                                            {Math.abs(item.amount[auth().currentUser.uid])}
                                                        </Text>
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
                        <View style={{ height: 75 }} />
                    </ScrollView>
            }
            <FAB
                icon={'plus'}
                extended={false}
                visible={true}
                color='white'
                style={styles.fab}
                backgroundColor='royalblue'
                onPress={() => { navigation.navigate('AddExpense', { gId: gData }) }}
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
        marginBottom: 5,
    },
    AppBarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 10
    },
    iconButton: {
        backgroundColor: "transparent",
        padding: 10,
        marginVertical: 10,
        marginHorizontal: 5,
        padding: 10,
    },
    profilePicture: {
        height: 40,
        width: 40,
        borderRadius: 40,
        marginHorizontal: 5
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
        bottom: 15,
        right: 15,
        position: 'absolute',
        borderRadius: 50,
    },
})