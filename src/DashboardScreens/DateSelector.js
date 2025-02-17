import React from 'react'
import { View, Text, StyleSheet} from 'react-native'
import Colors from '../../assets/colors/Colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native';



const DateSelector = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>
                    Select Month
                </Text>
            </View>
        </View>
    )
}

export default DateSelector


const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: Colors.shade1
    },
    headerBox: {
        backgroundColor: Colors.white,
        height: '8%',
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 15,
        elevation: 5,
        marginBottom: 10
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
})