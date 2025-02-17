import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native';



const AccountSettings = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>
                    Account Settings
                </Text>
            </View>
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => navigation.navigate('BugReport')}>
                <View style={styles.settingContainer}>
                    <Icon name="bug-report" color={Colors.black} size={24} />
                    <Text style={styles.settingText}>
                        Report Bugs or Give Feedback
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => navigation.navigate('DeleteAccount')}>
                <View style={styles.settingContainer}>
                    <Icon name="delete" color={Colors.black} size={24} />
                    <Text style={styles.settingText}>
                        Delete Account
                    </Text>
                </View>
            </TouchableOpacity>
            {/* <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => navigation.navigate('BlockList')}>
                <View style={styles.settingContainer}>
                    <Icon name="block" color={Colors.black} size={24} />
                    <Text style={styles.settingText}>
                        Blocklist
                    </Text>
                </View>
            </TouchableOpacity> */}
        </View>
    )
}

export default AccountSettings


const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: Colors.shade1
    },
    headerBox: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'silver',
        margin: 15,
        borderRadius: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    settingContainer: {
        backgroundColor: Colors.white,
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
    },
    settingText: {
        color: Colors.black,
        margin:10
    },
})