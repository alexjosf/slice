import { View, Text,StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import React from 'react'

const HeaderBox = ({Title}) => {
    return (
        <View style={styles.headerBox}>
            <Text style={styles.headerText}>
                {Title}
            </Text>
        </View>
    )
}

export default HeaderBox

const styles = StyleSheet.create({
    headerBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: 'silver',
        margin: 12,
        borderRadius: 12,
        flex:1
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
})