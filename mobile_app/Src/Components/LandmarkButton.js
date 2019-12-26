import React from 'react';
import { StyleSheet, Text, View, Animated, Image, Dimensions } from "react-native";


import AwesomeButton from "react-native-really-awesome-button/src/themes/rick";

class LandmarkButton extends React.Component{

    //landmark view enabling button click function
    buttonClick = (clickBool) => {
        this.props.buttonClickProp(clickBool);
    }

    render() {
        return( 
        <AwesomeButton
            type="anchor"
            style={styles.buttonStyles}
                onPress={next => {
                    this.buttonClick(true)
                    next();
                }}
        >Landmark Mode</AwesomeButton>
        );
    }
}

const styles = StyleSheet.create({
    buttonStyles: {
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        top: 10,
        right :10,
        alignSelf: "center",
        justifyContent: "space-between",
        borderRadius: 20
    },
});

export default LandmarkButton;

