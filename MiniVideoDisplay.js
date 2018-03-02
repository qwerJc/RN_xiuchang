import React, { Component } from 'react';

import {
    AppRegistry,
    Dimensions,
    Image,
    NativeModules,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

// const IS_3X_DEVIDE = Dimensions.get('window').height == 736 || Dimensions.get('window').height == 812;

// const IS_5_5_SCREEN = Dimensions.get('window').height == 736;
// const IS_4_7_SCREEN = Dimensions.get('window').height == 667;

const ANCHOR_POST_GAP = 7;

export default class MiniVideoDisplay extends Component {

    static defaultProps = {
        dataDic : {},
    }

    constructor(props: any) {
        super(props);

        this.rnCallNativeManager = NativeModules.RNCallNativeManager; // rn 向 native 发送通知
    }

    render() {

        let picWidth = Math.ceil((SCREEN_WIDTH - ANCHOR_POST_GAP * 4) / 3);
        let picHeight = Math.ceil(picWidth / 231 * 308);

        let strTime = this.formatTime(this.props.dataDic.tm);

        return(
            <View style={{
                flexDirection:'column',

                marginLeft:ANCHOR_POST_GAP,
                marginTop:0,
                width:picWidth,
                height:picHeight + 25,
            }}>
                {/*视频封面一大坨*/}
                <View style={{
                    marginLeft:0,
                    marginTop:0,
                    width:picWidth,
                    height:picHeight,

                    overflow:'hidden',
                }}>
                    <Image style={{
                        position:'absolute',

                        marginLeft:0,
                        marginTop:0,
                        width:picWidth,
                        height:picHeight,

                        borderRadius:4,
                        overflow:'hidden',
                    }} source={{uri: this.props.dataDic.pospic}}>
                    </Image>

                    <Image style={{
                        position:'absolute',

                        marginLeft:0,
                        marginTop:picHeight - 102,
                        width:picWidth,
                        height:102,

                        resizeMode:'stretch',
                    }} source={require('./images/MiniVideo/mini_video_lobby_mask.png')}>
                    </Image>

                    <Text style={{
                        position:'absolute',

                        marginLeft:picWidth - 4 - 50,
                        marginTop:4,
                        width:50,
                        height:15,

                        backgroundColor:'rgba(255,255,255,0)',

                        color:'rgba(255,255,255,1)',
                        fontSize:10,
                        fontWeight:'normal',
                        textAlign:'right',

                        textShadowOffset:{width:0, height:1},
                        textShadowRadius:0,
                        textShadowColor:'grey',
                    }}>
                        {strTime}
                    </Text>

                    <Image style={{
                        position:'absolute',

                        marginLeft:(picWidth - 30) / 2,
                        marginTop:(picHeight - 30) / 2,
                        width:30,
                        height:30,
                    }} source={require('./images/MiniVideo/mini_video_lobby_play_button.png')}>
                    </Image>

                    <Text style={{
                        position:'absolute',

                        marginLeft:4,
                        marginTop:134,
                        width:picWidth - 8,
                        height:13,

                        backgroundColor:'rgba(255,255,255,0)',

                        color:'rgba(255,255,255,1)',
                        fontSize:12,
                        fontWeight:'normal',
                        textAlign:'left',
                    }} numberOfLines={1}>
                        {this.props.dataDic.title}
                    </Text>

                </View>

                {/*头像、昵称横条*/}
                <View style={{
                    flexDirection:'row',

                    marginLeft:0,
                    marginTop:0,
                    width:picWidth,
                    height:25,
                }}>

                    <Image style={{
                        marginLeft:5,
                        marginTop:5,
                        width:20,
                        height:20,

                        borderRadius:10,
                        overflow:'hidden',
                    }} source={{uri: this.props.dataDic.avstar}}>
                    </Image>

                    <Text style={{
                        marginLeft:5,
                        marginTop:8,
                        width:picWidth - 5 - 20 - 5 - 5,
                        height:14,

                        color:'rgba(102,102,102,1)',
                        fontSize:11,
                        fontWeight:'normal',
                        textAlign:'left',
                    }} numberOfLines={1}>
                        {this.props.dataDic.alias}
                    </Text>

                </View>

                {/*罩个大按钮*/}
                <TouchableOpacity style={{
                    position:'absolute',

                    marginLeft:0,
                    marginTop:0,
                    width:picWidth,
                    height:picHeight + 25,
                }} onPress={this.miniVideoButtonAction.bind(this, this.props.dataDic)} activeOpacity={1}>

                </TouchableOpacity>
            </View>
        );
    }

    formatTime(timeInSec) {

        let minute = Math.floor(timeInSec / 60);
        let second = timeInSec - minute * 60;

        let strTime = minute >= 10 ? minute : '0' + minute;
        strTime = strTime + ':';
        strTime = second >= 10 ? strTime + second : strTime + '0' + second;

        return strTime;
    }

    miniVideoButtonAction(dataDic) {
        this.rnCallNativeManager.rnCallNativeWithEvent('openMiniVideoRoom', dataDic);
        // this.props.jashcallback(dataDic.username);
    }
}

const styles = StyleSheet.create({
    bgView: {
        flexDirection:'column',

        marginLeft:ANCHOR_POST_GAP,
        marginTop:0,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 + 36,

        overflow:'hidden',

        backgroundColor:'rgba(255,255,255,1)',
    },
});
