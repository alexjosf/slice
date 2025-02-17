import React, { useState } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

data = [
  {
    id: 0,
    name: "Bills",
    iconname: 'text-box',
    selected: false
  },
  {
    id: 1,
    name: "Commute",
    iconname: 'bus',
    selected: false
  },
  {
    id: 2,
    name: "Food",
    iconname: 'food',
    selected: false
  },
  {
    id: 3,
    name: "Fuel",
    iconname: 'fuel',
    selected: false
  },
  {
    id: 4,
    name: "Shop",
    iconname: 'shopping',
    selected: false
  },
  {
    id: 5,
    name: "Entertainment & Others",
    iconname: 'gift',
    selected: false
  },
]

export default RenderCategories = (categor) => {
  const [category, setCategory] = useState("")
  
  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => [setCategory(item.name)]}>
          <View style={[styles.categoryContainer,
          (item.name == category) ? { backgroundColor: 'grey' } : { backgroundColor: 'white' }]}>
            <Icon name={item.iconname} size={20} color={'blue'} />
            <Text style={{ marginLeft: 5, color: 'black' }}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}


const styles = StyleSheet.create({
  categoryContainer: {
    margin: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    borderWidth: 1,
},
})