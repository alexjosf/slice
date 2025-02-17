import React from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../assets/colors/Colors';
import BlockedMember from '../_Components/BlockedMember';

const BlockList = () => {
  return (
    <View style={styles.container}>
      <View style={styles.AppBar}>
        <Text style={styles.AppBarText}>
          Blocklist
        </Text>
      </View>
      <BlockedMember/>
    </View>
  )
}

export default BlockList

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.bgColor
  },
  AppBar: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    height: 65,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  AppBarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
})