import React, { useEffect, useState, useCallback } from 'react'
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import { useNavigation } from '@react-navigation/native';
import { FAB } from 'react-native-paper';
import userDataStore from '../../store';
import { useQuery } from '@tanstack/react-query';
import { ImageHolderGroup } from '../_Components/ImageHolderGroup';

const Groups = () => {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const groupID = userDataStore((state) => state.groupID)
    const getGroupDataFireStore = userDataStore((state) => state.getGroupDataFireStore)

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['groupData'], // Cache key
        queryFn: getGroupDataFireStore, // Fetch function
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
                    Groups
                </Text>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => navigation.navigate('NewGroup')}>
                    <View style={styles.iconButton}>
                        <Text style={styles.iconText}>+ New Group</Text>
                    </View>
                </TouchableOpacity>
            </View>
            {isLoading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
                : (groupID.length == 0) ?
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={SettleImageData[Math.floor(Math.random() * 9)]} style={{ height: 125, width: 125 }} />
                        <Text>
                            No Groups yet.
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
                            keyExtractor={item => item.gid}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={() => navigation.navigate('GroupMessages', { gData: item, gId: item.gid, gname: item.gname, imageurl: item.imageurl, random: Math.floor(Math.random() * 9) })}>
                                    <View style={styles.groupContainer}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={styles.groupDataWrapper}>
                                                {(item.imageurl) ?
                                                    <Image source={{ uri: item.imageurl }} style={styles.groupImage} />
                                                    :
                                                    <ImageHolderGroup emoji={item.emoji} size={40} num={item.imagenum} />
                                                }
                                                <View style={styles.groupRow}>
                                                    <Text style={styles.groupName}>
                                                        {item.gname}
                                                    </Text>
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
                onPress={() => [navigation.navigate('AddExpense', {})]}
            />
        </View>
    )
}

export default Groups

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
        color: 'black'
    },
    iconButton: {
        backgroundColor: "transparent",
        marginVertical: 10,
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    },
    iconText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green
    },
    groupContainer: {
        marginVertical: 5,
        marginHorizontal: 10,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupDataWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    groupImage: {
        width: 40,
        height: 40,
        borderRadius: 60
    },
    groupName: {
        fontWeight: 'bold',
        color: Colors.black,
        fontSize: 14,
        marginLeft:10
    },
    groupRow: {
        paddingHorizontal: 5,
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
})