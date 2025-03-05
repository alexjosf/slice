import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import { useNavigation } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";

export default function NoConnection() {
    const navigation = useNavigation();
    const [isConnected, setIsConnected] = useState(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const checkInternet = ()=>{
        if(isConnected){
            navigation.replace('BottomNav')
        }
    }


    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Image source={require('../../assets/images/noInternet.jpg')} style={{ height: 200, width: 200 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>
                    No Connection
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 14, color: 'black' }}>
                    Please check your internet Connectivity {'\n'}and try again
                </Text>
                <TouchableOpacity onPress={() => checkInternet()}>
                    <View style={styles.buttonContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.buttonText}>
                                Retry
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View >
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        padding: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderRadius: 5,
        marginHorizontal: 10,
        marginVertical: 10,
        backgroundColor: Colors.black
    },
    buttonText: {
        fontSize: 14,
        color: 'white',
    },
})