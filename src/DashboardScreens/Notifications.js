import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native';



const Notifications = () => {
    const navigation = useNavigation();
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
                    Notifications
                </Text>
                <View style={styles.iconButton}>
                    <Icon name='arrow-back-ios' size={20} color='transparent' />
                </View>
            </View >
        </View>
    )
}

export default Notifications


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
        borderRadius: 5,
        backgroundColor:'blue'
    },
})