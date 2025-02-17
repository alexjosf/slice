import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native';
import { FAB } from 'react-native-paper';
import CountryData from '../../assets/data/CountryData';
import userDataStore from '../../store';
import { ImageHolder } from '../_Components/ImageHolder';
import { useQuery } from '@tanstack/react-query';

const Friends = () => {
    const navigation = useNavigation();

    const [refreshing, setRefreshing] = useState(false);

    const userCountry = userDataStore((state) => state.userCountry)
    const friendID = userDataStore((state) => state.friendID)
    const balanceAmountFriends = userDataStore((state) => state.balanceAmountFriends)
    const getFriendDataFireStore = userDataStore((state) => state.getFriendDataFireStore)

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['friendData'], // Cache key
        queryFn: getFriendDataFireStore, // Fetch function
    });

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(async () => {
            await refetch()
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.AppBar}>
                <Text style={styles.AppBarText}>
                    Friends
                </Text>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => navigation.navigate('SearchFriend')}>
                    <View style={styles.iconButton}>
                        <Icon name='search' size={24} color={Colors.black} />
                    </View>
                </TouchableOpacity>
            </View>
            {isLoading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
                : (friendID.length == 0) ?
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={SettleImageData[Math.floor(Math.random() * 9)]} style={{ height: 125, width: 125 }} />
                        <Text>
                            No friends yet.
                        </Text>
                    </View>
                    :
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }>
                        <FlatList
                            data={data}
                            horizontal={false}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={item => item.uid}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={() => navigation.navigate('FriendMessages', { uid: item.uid, name: item.name, imageurl: item.imageurl, friendList: friendID, currency: CountryData[userCountry]['currency'], random: Math.floor(Math.random() * 9) })}>
                                    <View style={styles.friendContainer}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={styles.friendDataWrapper}>
                                                {(item.imageurl) ?
                                                    <Image source={{ uri: item.imageurl }} style={styles.friendImage} />
                                                    :
                                                    <ImageHolder text={item.name} size={40} />
                                                }

                                                <View style={styles.friendRow}>
                                                    <Text style={styles.friendName}>
                                                        {item.name}
                                                    </Text>
                                                    <View style={{ width: '30%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                        {(balanceAmountFriends[item.uid]) ?
                                                            <Text style={{
                                                                fontWeight: 'bold',
                                                                fontSize: 14,
                                                                color: ((balanceAmountFriends[item.uid]) >= 0) ? Colors.green : Colors.red,
                                                            }}>
                                                                {((balanceAmountFriends[item.uid]) >= 0) ? '+ ' : '- '}
                                                                {CountryData[userCountry]['currency']}
                                                                {(balanceAmountFriends[item.uid]) ? Math.abs(balanceAmountFriends[item.uid]) : 0}
                                                            </Text>
                                                            : (balanceAmountFriends[item.uid] == 0) ?
                                                                <Text style={{ color: Colors.blue2, fontSize: 14, fontWeight: '500' }}>Settled</Text>
                                                                :
                                                                <Text style={{ color: Colors.blue2, fontSize: 14, fontWeight: '500' }}>No Expense</Text>
                                                        }
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                        <View
                            style={{ height: 75 }}
                        />
                    </ScrollView>
            }
            <FAB
                icon={'plus'}
                label={'Expense'}
                extended={true}
                visible={true}
                style={styles.fab}
                color='white'
                backgroundColor='royalblue'
                onPress={() => [navigation.navigate('AddExpense', { friendIDs: friendID })]}
            />
        </View >
    )
}

export default Friends


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
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    iconButton: {
        backgroundColor: "transparent",
        marginVertical: 10,
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 5
    },
    friendContainer: {
        marginVertical: 5,
        marginHorizontal: 10,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        paddingVertical: 15,
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
        borderRadius: 60,
        marginRight: 10,
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