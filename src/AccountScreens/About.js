import React from 'react'
import { View, Text, StyleSheet, Image , TouchableOpacity} from 'react-native'
import Colors from '../../assets/colors/Colors';
import SettleImageData from '../../assets/data/SettleImageData';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function About() {
  const navigation = useNavigation();
  const route = useRoute();
  const random = route.params.random
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
          About
        </Text>
        <View style={styles.iconButton}>
          <Icon name='arrow-back-ios' size={20} color='transparent' />
        </View>
      </View>
      <View style={{ flex: 1, padding: 20, alignItems: 'center', marginTop: 25 }}>
        <Image source={SettleImageData[random]} style={{ height: 150, width: 150 }} />
        <Text style={{ textAlign: 'justify', marginTop: 50 }}>
          {'\u2022'} This application has been developed for learning purposes by Alex.
          {'\n'}
          {'\u2022'} It serves as a project to explore and enhance skills in mobile app development, focusing on transaction tracking functionality.
          {'\n'}
          {'\u2022'} All images used within the app are copyright-free and sourced from Vexel.com or created by developer.
          {'\n'}
          {'\u2022'}The app is continually evolving as new features and improvements are implemented, reflecting an ongoing learning journey in software development.
          {'\n'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.bgColor
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
  borderRadius: 5
},
})