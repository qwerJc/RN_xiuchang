//1、修改了style：BGView 的 marginLeft（改为在外部添加了不透明的间隔-用于遮挡下拉刷新View）

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
const SCREEN_HEIGHT = Dimensions.get('window').height;

const IS_3X_DEVIDE = Dimensions.get('window').height == 736 || Dimensions.get('window').height == 812;

const IS_5_5_SCREEN = Dimensions.get('window').height == 736;
const IS_4_7_SCREEN = Dimensions.get('window').height == 667;

const ANCHOR_POST_GAP = 7;

export default class AnchorPostDisplay extends Component {

    static defaultProps = {
        dataDic : {},
        tagsDic : [],
    }

    constructor(props: any) {
        super(props);

        this.rnCallNativeManager = NativeModules.RNCallNativeManager; // rn 向 native 发送通知
    }

    render() {
        let audienceCountWidth = 6 * this.props.dataDic.count.toString().length;

        return(
            <View style={styles.bgView}>
                {this.renderAnchorPicView()}

                <View style={styles.bottomBar}>
                    <Text style={styles.nameLabel} numberOfLines={1}>
                        {this.props.dataDic.username}
                    </Text>

                    <Image style={{
                        position:'absolute',

                        marginLeft:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 - 10 - audienceCountWidth - 6 - 12,
                        marginTop:13,
                        width:12,
                        height:12,
                    }} source={require('./images/LiveLobby/live_list_icon_audienceCount.png')}>
                    </Image>

                    <Text style={{
                        position:'absolute',

                        marginLeft:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 - 10 - 40,
                        marginTop:12,
                        width:40,
                        height:16,

                        backgroundColor:'rgba(0,0,0,0)',

                        color:'rgba(153,153,153,1)',
                        fontSize:11,
                        fontWeight:'normal',
                        textAlign:'right',
                    }} numberOfLines={1}>
                        {this.props.dataDic.count}
                    </Text>
                </View>

                {this.renderTags()}

                {this.renderCorners()}

                <TouchableOpacity style={{
                    position:'absolute',

                    marginLeft:0,
                    marginTop:0,
                    width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
                    height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 + 36,
                }} onPress={this.anchorButtonAction.bind(this, this.props.dataDic)} activeOpacity={1}>

                </TouchableOpacity>
            </View>
        );
    }

    renderAnchorPicView() {
        if (IS_5_5_SCREEN) {
            return(
                <View style={styles.anchorPicContainer}>
                    <Image style={styles.anchorPicPlaceholder} source={require('./images/LiveLobby/live_list_placeholder_1242.png')}>
                    </Image>
                    <Image style={styles.anchorPic} source={{uri: this.props.dataDic.pospic}}>
                    </Image>
                    <Image style={styles.anchorShadow} source={require('./images/LiveLobby/live_list_image_banner_mask.png')}>
                    </Image>
                </View>
            );
        } else if (IS_4_7_SCREEN) {
            return(
                <View style={styles.anchorPicContainer}>
                    <Image style={styles.anchorPicPlaceholder} source={require('./images/LiveLobby/live_list_placeholder_750.png')}>
                    </Image>
                    <Image style={styles.anchorPic} source={{uri: this.props.dataDic.pospic}}>
                    </Image>
                    <Image style={styles.anchorShadow} source={require('./images/LiveLobby/live_list_image_banner_mask.png')}>
                    </Image>
                </View>
            );
        } else {
            return(
                <View style={styles.anchorPicContainer}>
                    <Image style={styles.anchorPicPlaceholder} source={require('./images/LiveLobby/live_list_placeholder_640.png')}>
                    </Image>
                    <Image style={styles.anchorPic} source={{uri: this.props.dataDic.pospic}}>
                    </Image>
                    <Image style={styles.anchorShadow} source={require('./images/LiveLobby/live_list_image_banner_mask.png')}>
                    </Image>
                </View>
            );
        }
    }

    renderTags() {

        let tagsPic = [];
        let tagsWidth = [];

        for (let i = 0; i < this.props.dataDic.tagids.length; i++) {
            let tagID = this.props.dataDic.tagids[i];

            for (let j = 0; j < this.props.tagsDic.length; j++) {
                if (tagID == this.props.tagsDic[j].id) {
                    if (IS_3X_DEVIDE) {
                        tagsPic.push(this.props.tagsDic[j].viewPicSmall.img3x);
                        tagsWidth.push(this.props.tagsDic[j].viewPicSmall.img3xw / 3);
                    } else {
                        tagsPic.push(this.props.tagsDic[j].viewPicSmall.img2x);
                        tagsWidth.push(this.props.tagsDic[j].viewPicSmall.img2xw / 2);
                    }
                    break;
                }
            }
        }

        switch (tagsPic.length) {
            case 0: {
                return(
                    <View style={styles.tagsView}>
                    </View>
                );
            }
            break;

            case 1: {
                return(
                    <View style={styles.tagsView}>
                        <Image style={{
                            marginLeft:10,
                            marginTop:0,
                            width:tagsWidth[0],
                            height:18,
                        }} source={{uri: tagsPic[0]}}>
                        </Image>
                    </View>
                );
            }
            break;

            case 2: {
                return(
                    <View style={styles.tagsView}>
                        <Image style={{
                            marginLeft:10,
                            marginTop:0,
                            width:tagsWidth[0],
                            height:18,
                        }} source={{uri: tagsPic[0]}}>
                        </Image>
                        <Image style={{
                            marginLeft:5,
                            marginTop:0,
                            width:tagsWidth[1],
                            height:18,
                        }} source={{uri: tagsPic[1]}}>
                        </Image>
                    </View>
                );
            }
            break;

            default: {
                return(
                    <View style={styles.tagsView}>
                        <Image style={{
                            marginLeft:10,
                            marginTop:0,
                            width:tagsWidth[0],
                            height:18,
                        }} source={{uri: tagsPic[0]}}>
                        </Image>
                        <Image style={{
                            marginLeft:5,
                            marginTop:0,
                            width:tagsWidth[1],
                            height:18,
                        }} source={{uri: tagsPic[1]}}>
                        </Image>
                        <Image style={{
                            marginLeft:5,
                            marginTop:0,
                            width:tagsWidth[2],
                            height:18,
                        }} source={{uri: tagsPic[2]}}>
                        </Image>
                    </View>
                );
            }
            break;
        }
    }

    renderCorners() {
        return(
            <View style={styles.cornerView}>
                <Image style={styles.topLeftCorner} source={require('./images/LiveLobby/live_list_icon_corner_topLeft.png')}>
                </Image>
                <Image style={styles.topRightCorner} source={require('./images/LiveLobby/live_list_icon_corner_topRight.png')}>
                </Image>
                <Image style={styles.bottomLeftCorner} source={require('./images/LiveLobby/live_list_icon_corner_bottomLeft.png')}>
                </Image>
                <Image style={styles.bottomRightCorner} source={require('./images/LiveLobby/live_list_icon_corner_bottomRight.png')}>
                </Image>
            </View>
        );
    }

    anchorButtonAction(dataDic) {
        this.rnCallNativeManager.rnCallNativeWithEvent('openLiveRoom', dataDic);
    }
}

const styles = StyleSheet.create({
    bgView: {
        flexDirection:'column',


        // marginLeft:ANCHOR_POST_GAP,
        marginTop:ANCHOR_POST_GAP,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 + 36,

        overflow:'hidden',

        backgroundColor:'rgba(255,255,255,1)',
    },

    anchorPicContainer: {
        marginLeft:0,
        marginTop:0,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
    },

    anchorPicPlaceholder: {
        marginLeft:0,
        marginTop:0,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,

        resizeMode:'cover',
    },

    anchorPic: {
        position:'absolute',

        marginLeft:0,
        marginTop:0,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,

        resizeMode:'cover',
    },

    anchorShadow: {
        position:'absolute',

        marginLeft:0,
        marginTop:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 - 30,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:30,

        resizeMode:'stretch',
    },

    bottomBar: {
        flexDirection:'row',

        marginLeft:0,
        marginTop:0,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:36,
    },

    nameLabel: {
        marginLeft:10,
        marginTop:12,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 - 10 - 60,
        height:16,

        color:'rgba(0,0,0,1)',
        fontSize:12,
        fontWeight:'normal',
        textAlign:'left',
    },

    tagsView: {
        position:'absolute',

        flexDirection:'row',

        marginLeft:0,
        marginTop:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 - 23,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:18,
    },

    cornerView: {
        position:'absolute',

        marginLeft:0,
        marginTop:0,
        width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
        height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 + 36,
    },

    topLeftCorner: {
        position:'absolute',

        marginLeft:0,
        marginTop:0,
        width:5,
        height:5,
    },

    topRightCorner: {
        position:'absolute',

        marginLeft:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 - 5,
        marginTop:0,
        width:5,
        height:5,
    },

    bottomLeftCorner: {
        position:'absolute',

        marginLeft:0,
        marginTop:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 + 36 - 5,
        width:5,
        height:5,
    },

    bottomRightCorner: {
        position:'absolute',

        marginLeft:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 - 5,
        marginTop:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 + 36 - 5,
        width:5,
        height:5,
    },
});
