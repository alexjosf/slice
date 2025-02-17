import React from 'react'
import FriendsData from '../../assets/data/FriendsData'
import Colors from '../../assets/colors/Colors'
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native';

const BlockedMember = () => {
    const navigation = useNavigation();

    const UnBlock = () => {
        Alert.alert('UNBLOCK', 'Do you really want to unblock?',
            [
                {
                    text: 'CANCEL',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Unblock',
                    onPress: () => [console.log('Unblocked')],
                    color: 'black'
                },
            ]
        );
    }

    return (
        <FlatList
            data={FriendsData}
            keyExtractor={item => item.id}
            horizontal={false}
            renderItem={({ item }) => {
                return (
                    <View style={styles.friendListWrapper}>
                        <View style={styles.friendDataWrapper}>
                            <Image source={{ uri: item.image }} style={styles.friendListImage} />
                            <Text style={styles.friendListName}>
                                {item.name}
                            </Text>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => [UnBlock()]}>
                            <View>
                                <Icon name='refresh' size={24} color={Colors.green} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            }}
        />
    )
}

export default BlockedMember

const styles = StyleSheet.create({
    friendListWrapper: {
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
    friendDataWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    friendListImage: {
        width: 30,
        height: 30,
        borderRadius: 30
    },
    friendListName: {
        fontWeight: 'bold',
        color: Colors.black,
        fontSize: 14,
        marginLeft: 10
    },
})