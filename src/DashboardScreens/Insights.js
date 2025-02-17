import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialIcons';
import PieChart from 'react-native-pie-chart'
import auth from '@react-native-firebase/auth';
import DateString from '../_Components/DateString';
import userDataStore from '../../store';

export default Insights = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const currency = route.params.currency;
    const transactionData = userDataStore((state) => state.transactionData)

    const [pieData, setPieData] = useState({})
    const [totalSpent, setTotalSpent] = useState()
    const [transactions, setTransactions] = useState();
    const [date, setDate] = useState(new Date());
    const [displayDate, setDisplayDate] = useState(new Date().toLocaleString('default', { month: 'long' }) + " " + new Date().getFullYear());
    const [random, setRandom] = useState(Math.floor(Math.random() * 9));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            setLoading(true)
            getTransaction()
            async function getTransaction() {
                let temp = [];
                transactionData.forEach((document) => {
                    if (DateString(document.date).split(" ")[1] === date.toDateString().split(" ")[1] && DateString(document.date).split(" ")[3] == date.toDateString().split(" ")[3]) {
                        if (document.split) {
                            if (document.split[auth().currentUser.uid]) {
                                temp.push({ 'category': document.category, 'amount': document.split[auth().currentUser.uid] })
                            }
                        } else if (document.type == "Self Expense") {
                            temp.push({ 'category': document.category, 'amount': document.amount })
                        }
                    }
                    setTransactions(temp)
                })
            }
        }

        return () => { isMounted = false; };
    }, [date, displayDate])

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            let Categories = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
            let total = 0
            if (transactions) {
                for (expense in transactions) {
                    if (transactions[expense]['category']) {
                        total += +parseFloat(transactions[expense]['amount']).toFixed(2)
                        Categories[transactions[expense]['category']] += +parseFloat(transactions[expense]['amount']).toFixed(2)
                    }
                }
                setPieData(Categories)
                setTotalSpent(total)
            }
            setLoading(false)
        }

        return () => { isMounted = false; };
    }, [transactions])

    const previousMonth = (date) => {
        let currentDate = date
        currentDate.setMonth(currentDate.getMonth() - 1);
        setDate(currentDate)
        setDisplayDate(currentDate.toLocaleString('default', { month: 'long' }) + " " + currentDate.getFullYear())
        setRandom(Math.floor(Math.random() * 9))
    }

    const nextMonth = (date) => {
        let currentDate = date
        currentDate.setMonth(currentDate.getMonth() + 1);
        setDate(currentDate)
        setDisplayDate(currentDate.toLocaleString('default', { month: 'long' }) + " " + currentDate.getFullYear())
        setRandom(Math.floor(Math.random() * 9))
    }

    const PieItems = ({ colour, category, amount }) => {
        return (
            <View style={{ margin: 2.5 }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{
                        height: 10,
                        width: 10,
                        margin: 5,
                        backgroundColor: colour,
                        borderRadius: 25,
                    }} />
                    <Text style={{ color: 'black' }}>{category}({currency}{amount})</Text>
                </View>
            </View>

        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.AppBar}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => navigation.goBack()}>
                    <View style={styles.iconButton}>
                        <Icon name='arrow-back-ios' size={20} color={Colors.black} />
                    </View>
                </TouchableOpacity>
                <Text style={styles.AppBarText}>
                    Insights
                </Text>
                <View style={styles.iconButton}>
                    <Icon name='arrow-back-ios' size={20} color='transparent' />
                </View>
            </View >
            <View style={styles.dateWrapper}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => previousMonth(date)}>
                    <View style={styles.dateIcon}>
                        <Icon name='arrow-back-ios' size={20} color={Colors.black} />
                    </View>
                </TouchableOpacity>
                <Text style={{
                    fontWeight: '500',
                    color: "black",
                    fontSize: 15,
                }}>
                    {displayDate}
                </Text>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => nextMonth(date)}>
                    <View style={styles.dateIcon}>
                        <Icon name='arrow-forward-ios' size={20} color={Colors.black} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.pieChartWrapper}>
                <Text style={styles.pieText}>
                    Expense
                </Text>

                {(loading) ?
                    <View style={{ height: 260, width: 260, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator />
                    </View>
                    :
                    (!totalSpent) ?
                        <View style={{ margin: 58 }}>
                            <Image source={SettleImageData[random]} style={{ height: 125, width: 125 }} />
                            <Text>No data available.</Text>
                        </View>
                        :
                        <View>
                            <PieChart
                                widthAndHeight={260}
                                series={[
                                    pieData[0],
                                    pieData[1],
                                    pieData[2],
                                    pieData[3],
                                    pieData[4],
                                    pieData[5]
                                ]}
                                sliceColor={[
                                    '#009688',
                                    '#9c27b0',
                                    '#8bc34a',
                                    '#ffc107',
                                    "#f44336",
                                    '#03a9fa',]}
                                coverRadius={0.70}
                                coverFill={'transparent'}
                            />
                            <View style={{
                                position: 'absolute',
                                width: 260,
                                height: 260,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                                    {currency}
                                    {totalSpent}
                                </Text>
                            </View>
                        </View>
                }
                <View style={{ height: 20 }} />
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View>
                        <PieItems colour="#009688" category="Billing" amount={pieData[0]} />
                        <PieItems colour="#9c27b0" category="Commute" amount={pieData[1]} />
                        <PieItems colour="#8bc34a" category="Food" amount={pieData[2]} />
                    </View>
                    <View>
                        <PieItems colour="#ffc107" category="Fuel" amount={pieData[3]} />
                        <PieItems colour="#f44336" category="Shopping" amount={pieData[4]} />
                        <PieItems colour="#03a9fa" category="Others" amount={pieData[5]} />
                    </View>
                </View>
            </View>
        </View >
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
    },
    dateWrapper: {
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        flexDirection: 'row',
        margin: 10,
        borderRadius: 10,
        padding: 5,
    },
    dateIcon: {
        backgroundColor: "transparent",
        padding: 10,
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