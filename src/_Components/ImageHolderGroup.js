import React from 'react'
import { Text, View } from 'react-native'

export const ImageHolderGroup = ({ emoji, size, num }) => {
    const colorArray = ['blue', 'blueviolet', 'darkblue', 'darkgreen', 'deeppink', 'dodgerblue', 'green', 'indianred', 'indigo', 'maroon', 'navy', 'peru', 'purple', 'royalblue', 'red', 'royalblue', 'violet']
    return (
        <View style={{
            height: size,
            width: size,
            borderRadius: size,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colorArray[num],
        }}>
            <Text style={{
                color: 'white',
                fontSize: size / 2
            }}>
                {emoji}
            </Text>
        </View>
    )
}
