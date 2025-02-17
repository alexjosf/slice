import React from 'react'
import { Text, View } from 'react-native'

export const ImageHolder = ({ text, size }) => {
    const colorArray = ['blue', 'blueviolet', 'darkblue', 'darkgreen', 'deeppink', 'dodgerblue', 'green', 'indianred', 'indigo', 'maroon', 'navy', 'peru', 'purple', 'royalblue', 'red', 'royalblue', 'violet']
    return (
        <View style={{
            height: size,
            width: size,
            borderRadius: size,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colorArray[Math.floor(Math.random() * colorArray.length)],
        }}>
            <Text style={{
                color: 'white',
                fontSize: size / 2.5
            }}>
                {text.split(" ")[0][0] + text.split(" ")[1][0]}
            </Text>
        </View>
    )
}
