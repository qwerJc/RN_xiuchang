import React, {Component} from 'react';
import {
    Dimensions,
    StyleSheet,
    Image,
    ImageBackground,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class EmptyPostDisplay extends React.Component {
    static defaultProps = {
        layoutType:'',//0-附近，1-好声音，2-通用
    }
    render() {
        switch (this.props.layoutType){
            case 0:{
                return (
                    <ImageBackground style={styles.vincintyContainer}
                                     source={require('./images/LiveLobby/live_list_image_empty_mask.png')}
                                     resizeMode='stretch'>
                        <Image source={require('./images/LiveLobby/live_list_icon_anchorEmpty.png')}
                        />
                    </ImageBackground>
                );
                break;
            }
            case 1:{
                return (
                    <ImageBackground style={styles.goodVoiceContainer}
                                     source={require('./images/LiveLobby/live_list_image_empty_mask.png')}
                                     resizeMode='stretch'>
                        <Image source={require('./images/LiveLobby/live_list_icon_anchorEmpty.png')}
                        />
                    </ImageBackground>
                );
                break;
            }
            case 2:{
                return (
                    <ImageBackground style={styles.universalContainer}
                                     source={require('./images/LiveLobby/live_list_image_empty_mask.png')}
                                     resizeMode='stretch'>
                        <Image source={require('./images/LiveLobby/live_list_icon_anchorEmpty.png')}
                        />
                    </ImageBackground>
                );
                break;
            }
            default:{
                return (
                    <ImageBackground style={styles.universalContainer}
                                     source={require('./images/LiveLobby/live_list_image_empty_mask.png')}
                                     resizeMode='stretch'>
                        <Image source={require('./images/LiveLobby/live_list_icon_anchorEmpty.png')}
                        />
                    </ImageBackground>
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
});
module.exports = EmptyPostDisplay;