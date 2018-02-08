import React, {Component} from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class FailPostDisplay extends React.Component {
    static defaultProps = {
        layoutType: '',//0-附近，1-好声音，2-通用
    }

    render() {
        switch (this.props.layoutType) {
            case 0: {
                return (
                    <View style={styles.vicinityContainer}>
                        <Text style={styles.containerText}>请下拉刷新试试</Text>
                    </View>
                );
                break;
            }
            case 1: {
                return (
                    <View style={styles.goodVoiceContainer}>
                        <Text style={styles.containerText}>请下拉刷新试试</Text>
                    </View>
                );
                break;
            }
            case 2: {
                return (
                    <View style={styles.universalContainer}>
                        <Text style={styles.containerText}>请下拉刷新试试</Text>
                    </View>
                );
                break;
            }
            default: {
                return (
                    <View style={styles.universalContainer}>
                        <Text style={styles.containerText}>请下拉刷新试试</Text>
                    </View>
                );
                break;
            }
        }
    }
}

const styles = StyleSheet.create({
    //附近界面
    vicinityContainer: {
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

    containerText: {
        color: 'gray',
    },
});
module.exports = FailPostDisplay;