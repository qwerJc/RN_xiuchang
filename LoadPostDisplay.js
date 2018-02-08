import React, {Component} from 'react';
import {
    Dimensions,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class LoadPostDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static defaultProps = {
        layoutType:'',//0-附近，1-好声音，2-通用
    }
    render() {
        switch (this.props.layoutType){
            case 0:{
                return (
                    <View style={styles.vincintyContainer}>
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={styles.containerIndicator}
                            size="large"/>
                    </View>
                );
                break;
            }
            case 1:{
                return (
                    <View style={styles.goodVoiceContainer}>
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={styles.containerIndicator}
                            size="large"/>
                    </View>
                );
                break;
            }
            case 2:{
                return (
                    <View style={styles.universalContainer}>
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={styles.containerIndicator}
                            size="large"/>
                    </View>
                );
                break;
            }
            default:{
                return (
                    <View style={styles.universalContainer}>
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={styles.containerIndicator}
                            size="large"/>
                    </View>
                );
                break;
            }
        }
    }
}

const styles = StyleSheet.create({
    //附近界面
    vincintyContainer: {
        height: SCREEN_HEIGHT - 225,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(240,240,240,1)',
    },
    //好声音界面
    goodVoiceContainer: {
        height: SCREEN_HEIGHT - 290,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(240,240,240,1)',
    },
    //通用界面
    universalContainer: {
        height: SCREEN_HEIGHT - 170,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(240,240,240,1)',
    },
    containerIndicator: {
        height: 80,
    },
});

module.exports = LoadPostDisplay;