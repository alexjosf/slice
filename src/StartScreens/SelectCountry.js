import React, { useEffect } from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
} from 'react-native'
import Colors from '../../assets/colors/Colors'
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import CountryData from '../../assets/data/CountryData';
import auth from '@react-native-firebase/auth';

export default function SelectCountry() {
    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged((user) => {
            if (user) {
                navigation.replace('LogIn', { dialCode: '', country: '' });
            }
        }
        )

        return () => unsubscribe();
    }, [])


    return (
        <View style={styles.container}>
            <View style={styles.appBar}>
                <Text style={styles.header}>
                    SELECT YOUR LOCATION
                </Text>
                <View />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}>
                <View>
                </View>
                <FlatList
                    data={Object.values(CountryData)}
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    keyExtractor={item => item.country}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={.7}
                            onPress={() => navigation.navigate('LogIn', { dialCode: item.dialCode, country: item.country })}>
                            <View style={[styles.countryListWrapper]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image source={item.image}
                                        style={styles.groupImage} />
                                    <Text style={styles.countryListText}>
                                        {item.country}
                                    </Text>
                                </View>
                                <Text style={styles.countryListText}>
                                    {item.dialCode}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
    },
    appBar: {
        backgroundColor: Colors.white,
        height: 50,
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    header: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.black
    },
    countryListWrapper: {
        margin: 5,
        marginHorizontal: 10,
        backgroundColor: Colors.bgColor,
        borderRadius: 5,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    groupImage: {
        height: 20,
        width: 20,
    },
    countryListText: {
        fontWeight: '500',
        color: Colors.black,
        fontSize: 14,
        marginLeft: 10
    },
})