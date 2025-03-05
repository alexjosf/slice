import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import CategoryData from '../../assets/data/CategoryData';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import DateString from '../_Components/DateString';
import userDataStore from '../../store';
import SettleImageData from '../../assets/data/SettleImageData';

export default function History() {
    const navigation = useNavigation();
    const route = useRoute();
    const random = route.params.random
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const transactionData = userDataStore((state) => state.transactionData)
    const userCountry = userDataStore((state) => state.userCountry)

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            getTransactions()
            function getTransactions() {
                const filteredTransactions = transactionData.filter(item => item.type !== 'Settlement Expense');
                let temp = filteredTransactions.sort((a, b) => b.date.toDate() - a.date.toDate());
                setTransactions(temp)
                setLoading(false)
            }
        }
        return () => { isMounted = false; };
    }, [refreshing]);


    return (
        <View style={styles.container}>
            <View style={styles.AppBar}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => navigation.goBack()}>
                    <View style={styles.iconButton}>
                        <Icon2 name='arrow-back-ios' size={20} color={Colors.black} />
                    </View>
                </TouchableOpacity>
                <Text style={styles.AppBarText}>
                    History
                </Text>
                <View style={styles.iconButton}>
                    <Icon2 name='arrow-back-ios' size={20} color='transparent' />
                </View>
            </View>
            {loading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
                :
                (transactionData.length == 0) ?
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={SettleImageData[random]} style={{ height: 125, width: 125 }} />
                        <Text>
                            No transactions yet.
                        </Text>
                    </View>
                    :
                    <ScrollView
                        contentContainerStyle={styles.scrollView}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }>
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
                                                                color: (item.amount[auth().currentUser.uid] > 0) ? Colors.green : Colors.red,
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
                    </ScrollView>
            }
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
        height: 60,
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
        marginVertical: 10,
        padding: 10,
        borderRadius: 5
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
})