/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {
    Component
} from 'react';
import {
    ScrollView,
    Platform,
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    Animated,
    TouchableOpacity,
} from 'react-native';

import GoodVoice from './GoodVoice'
import Dance     from './Dance'
import Vicinity  from './Vicinity'
// import MiniVideo from './MiniVideo'
import JcTry     from './jcTry'

var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});
export default class App extends Component <{}> {
    constructor(props) {
        super(props);
        this.state = {
            btn1Width: 44,
            btn1Height: 44,
        };
    }

    componentDidMount() {
        // console.log("【页面初始化】");
    }

    _onPressLive = () => {
        var param = {
            rate: '1',
            type: 'u0',
            size: '0',
            p: '0',
            av: '2.1',
        };

        var paramStr = JSON.stringify(param);
        console.log(paramStr);

        fetch('http://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getlivelistnew.php', {
            method: 'POST',
            body: paramStr,
        })
            .then((response) => response.json())
            .then((json) => {
                console.log("【************* Success *****************】 ");
                console.log(json)
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error)
            })
    }
    //<Dance/>
    //<GoodVoice/>
    // <Vicinity/>
    // <MiniVideo/>
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headBar}></View>

                <JcTry />

                <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={this._onPressLive}>
                        <View style={styles.bottomBarButton}>
                            <Image
                                source={require('./images/LiveLobby2/Tabbar_Icon_live.png')}
                                style={styles.bottomBarButtonIcon}>

                            </Image>
                            <Text>直播</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.bottomBarButton}>
                        <Image source={require('./images/LiveLobby2/Tabbar_Icon_attention.png')}
                               style={styles.bottomBarButtonIcon}></Image>
                        <Text>关注</Text>
                    </View>
                    <View style={styles.bottomBarButton}>
                        <Image source={require('./images/LiveLobby2/Tabbar_Icon_found.png')}
                               style={styles.bottomBarButtonIcon}></Image>
                        <Text>发现</Text>
                    </View>
                    <View style={styles.bottomBarButton}>
                        <Image source={require('./images/LiveLobby2/Tabbar_Icon_me.png')}
                               style={styles.bottomBarButtonIcon}></Image>
                        <Text>我</Text>
                    </View>
                </View>
            </View>

        );
    }
}
const styles = StyleSheet.create({
    headBar: {
        height: 64,
        backgroundColor: 'red',
    },
    bottomBar: {
        paddingLeft: 12,
        paddingRight: 12,
        height: 50,
        backgroundColor: 'white',
        flexDirection: 'row', //React Native 布局采用FlexBox(弹性布局),该属性是设置布局的主轴方向为row:横向(默认方向是竖向:column)
        justifyContent: 'space-between', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center'
    },
    bottomBarButton: {
        flexDirection: 'column',
        justifyContent: 'space-between', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center'
    },
    bottomBarButtonIcon: {
        height: 25,
        width: 25,
    },

    itemStyle: {
        // 尺寸
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        // flex: 1,
    },
    contentContainer: {
        width: SCREEN_WIDTH * 6,
        height: SCREEN_HEIGHT - 128,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: 'yellow',
    },
    container: {
        flex: 1,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});