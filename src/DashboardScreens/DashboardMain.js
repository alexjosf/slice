import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native';
import userDataStore from '../../store';

export default function Dashboard() {
    const navigation = useNavigation();
    const [payAmount, setPayAmount] = useState(0)
    const [getAmount, setGetAmount] = useState(0)
    const [refreshing, setRefreshing] = useState(false);
    const getUserDataFromFireStore = userDataStore((state) => state.getUserDataFromFireStore)
    const getIDFromFireStore = userDataStore((state) => state.getIDFromFireStore)
    const balanceAmountFriends = userDataStore((state) => state.balanceAmountFriends)
    const userData = userDataStore((state) => state.userData)

    const getCurrentDate = () => {
        const toDate = new Date().toDateString().split(" ")
        return toDate[0] + ", " + toDate[2] + " " + toDate[1];
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            getUserDataFromFireStore()
            getIDFromFireStore()
            getGroupTransaction()
            async function getGroupTransaction() {
                let get = 0
                let pay = 0
                for (i in balanceAmountFriends) {
                    if (balanceAmountFriends[i] >= 0) {
                        get += balanceAmountFriends[i]
                    }
                    else if (balanceAmountFriends[i] < 0) {
                        pay += balanceAmountFriends[i]
                    }
                }
                setGetAmount(+parseFloat(get).toFixed(2))
                setPayAmount(+parseFloat(Math.abs(pay)).toFixed(2))
            }
        }
        return () => { isMounted = false; };
    }, [refreshing])

    return (
        <View style={styles.container}>
            {/* HeaderBox*/}
            <View style={styles.headerBox}>
                <View>
                    {(userData["name"]) ?
                        <Text style={styles.boldText}>
                            Hello {userData["name"].split(" ")[0]}!
                        </Text> : <Text />
                    }
                    <Text style={styles.dateText}>{getCurrentDate()}</Text>
                </View>
                {/* <TouchableOpacity underlayColor="transparent"
                    onPress={() => [navigation.navigate('Notifications')]}>
                    <Icon name="notifications" size={24} color='black' />
                </TouchableOpacity> */}
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                {/*you Get, Pay Box*/}
                <View style={styles.paygetContainer}>
                    <View style={{ flexDirection: 'column', padding: 5 }}>
                        <View style={styles.youGetBox}>
                            <Text style={styles.boldText}>
                                You Get
                            </Text>
                            <Text style={styles.youGetAmount}>
                                {(userData["country"]) ? CountryData[userData["country"]]['currency'] : ''}
                                {getAmount}
                            </Text>
                        </View>
                        <View style={styles.youPayBox}>
                            <Text style={styles.boldText}>
                                You Pay
                            </Text>
                            <Text style={styles.youPayAmount}>
                                {(userData["country"]) ? CountryData[userData["country"]]['currency'] : ''}
                                {payAmount}
                            </Text>
                        </View>
                    </View>
                </View>

                {/*Buttons*/}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={() => [navigation.navigate('History', { random: Math.floor(Math.random() * 9)})]}>
                            <View style={styles.buttonContainer}>
                                <View style={{ alignItems: 'center' }}>
                                    <View style={styles.buttonIconWrapper}>
                                        <Icon name="timeline" size={24} color='white' />
                                    </View>
                                    <Text style={styles.buttonText}>History</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={() => [navigation.navigate('Insights', { currency: CountryData[userData["country"]]['currency'] })]}>
                            <View style={styles.buttonContainer}>
                                <View style={{ alignItems: 'center' }}>
                                    <View style={styles.buttonIconWrapper}>
                                        <Icon name="bar-chart" size={24} color='white' />
                                    </View>
                                    <Text style={styles.buttonText}>Insights</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    fab: {
        bottom: 16,
        right: 16,
        position: 'absolute',
        borderRadius: 50,
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: Colors.bgColor
    },
    headerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "white",
        padding: 15,
        margin: 10,
        borderRadius: 10,
    },
    boldText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black
    },
    dateText: {
        fontSize: 14,
        color: Colors.black,
        paddingVertical: 2,
    },
    paygetContainer: {
        backgroundColor: "white",
        padding: 5,
        margin: 10,
        borderRadius: 10,
    },
    youGetBox: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 10,
        margin: 5,
        borderWidth: 2,
        borderColor: Colors.green,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.greenContainer,
    },
    youPayBox: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 10,
        margin: 5,
        borderWidth: 2,
        borderColor: Colors.red,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.redContainer,
    },
    youGetAmount: {
        fontWeight: 'bold',
        fontSize: 16,
        color: Colors.green,
        fontWeight: 'bold',
    },
    youPayAmount: {
        fontWeight: 'bold',
        fontSize: 16,
        color: Colors.red,
        fontWeight: 'bold',
    },
    monthlySpendWrapper: {
        backgroundColor: "white",
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    monthlySpendAmount: {
        fontWeight: 'bold',
        color: "black",
        fontSize: 18,
    },
    buttonContainer: {
        backgroundColor: "white",
        margin: 10,
        padding: 40,
        paddingBottom: 40,
        borderRadius: 10,
    },
    buttonIconWrapper: {
        backgroundColor: Colors.black,
        padding: 10,
        borderRadius: 50,
        margin: 10,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '400',
        color: "black"
    },
    pieChartWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        padding: 10,
    },
    pieText: {
        fontWeight: 'bold',
        color: "black",
        fontSize: 18,
        marginBottom: 30
    },
})