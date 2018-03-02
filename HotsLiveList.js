import React, { Component } from 'react';

import {
    ActivityIndicator,
    Alert,
    AppRegistry,
    Dimensions,
    Image,
    NativeModules,
    ScrollView,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { XCCycleSlideView } from 'react-native-custom/XCCycleSlideView';

import AnchorPostDisplay from './AnchorPostDisplay.js';
import MiniVideoDisplay from './MiniVideoDisplay.js';

import PullDownRefreshView from './PullDownRefreshView'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const IS_5_8_DEVICE = Dimensions.get('window').height == 812;
const IS_3X_DEVIDE = Dimensions.get('window').height == 736 || Dimensions.get('window').height == 812;

const TAGS_BUTTON_HEIGHT = 82;
const ANCHOR_POST_GAP = 7;

// 第一节、第二节主播数量
const FIRST_SECTION_COUNT = 4;
const SECOND_SECTION_COUNT = 6;

// 重试次数限制
const RETRY_COUNT_LIMIT = 10;

export default class HotsLiveList extends Component {

    static defaultProps = {
        av : '',
        refreshInterval : 180000,

        // dataDic : {},
        // tagsDic : [],
    }

    constructor(props: any) {
        super(props);

        this.rnCallNativeManager = NativeModules.RNCallNativeManager; // rn 向 native 发送通知

        // 参数
        this.isInReview = false;
        this.uid = '';
        this.encpass = '';
        this.rand = '';
        this.tagID = '';

        // 状态
        this.requestLiveStatus = 0; // -1、无需请求 0、未请求 1、请求中 2、请求完成 3、请求失败
        this.requestPromotionsStatus = 0; // -1、无需请求 0、未请求 1、请求中 2、请求完成 3、请求失败
        this.isTagsLiveEmpty = false; // 选中的 tag 分类直播列表是否为空

        // 重试次数
        this.retryCount = 0;

        // 推广、直播数据
        this.arrPromotions = [];
        this.arrPromotions1 = [];
        this.arrLive = [];
        this.arrRec = []; // 精彩推荐，仅当选中 tag 时数据有效
        this.arrMiniVideo = []; // 小视频数据

        this.arrTags = []; // tagInfo
        this.arrMenuTags = [];
        this.recID = ''; //

        this.mainList;
        this._refPullDownRefreshView;
        this.mainListoffsetY = 0;
        this.timeDate = 0;
        this.isTouchPullDown = false; //判断当前是否处于用户拖动状态

        this.state = {
            sections: [],

            selectedTagIndex: 0, // 选中的 tag
            isLoadingTags: false,
        };

        this.backToRecButtonAction = this.backToRecButtonAction.bind(this);
        this.miniVideoRecButtonAction = this.miniVideoRecButtonAction.bind(this);
    }

    render() {
        return (
            <View style={styles.hotsLiveListContainer}>
                <PullDownRefreshView ref={(c) => this._refPullDownRefreshView = c}
                                     callbackPost={() => this.post()}/>

                <SectionList
                    style={styles.hotsLiveList}
                    stickySectionHeadersEnabled={false}
                    numColumns={1}
                    sections={this.state.sections}
                    // 回来看一下这个section
                    renderSectionHeader={
                        ({section}) => this.renderSectionHeader(section)
                    }
                    renderItem={
                        ({item, index}) => this.renderSectionCell(item, index)
                    }
                    ListHeaderComponent={
                        <View style={styles.sectionListHeader}>
                        </View>
                    }
                    ListFooterComponent={
                        <View style={styles.sectionListFooter}>
                        </View>
                    }
                    onScroll={(event) => this.mainScrollViewOnScroll(event.nativeEvent.contentOffset.y)}
                    ref={(refMainList) => {
                        this.mainList = refMainList;
                    }}
                    onResponderGrant={() => this._onStartTouch()}
                    onResponderRelease={() => this._onReleaseMouse()}
                />
            </View>
        );
    }

    renderSectionHeader(section) {

        let width = 0;
        let height = 0;

        switch (section.key) {
            case 0: {

                width = SCREEN_WIDTH;
                height = Math.floor(105 / 375 * width);

                let selectionBarOriginX = 10 + (60 + 14) * this.state.selectedTagIndex + 12.5;

                return (
                    <View style={{
                        flexDirection:'column',

                        marginLeft:0,
                        marginTop:0,
                        width:SCREEN_WIDTH,
                        height:height + TAGS_BUTTON_HEIGHT + ANCHOR_POST_GAP,
                    }}>
                        <XCCycleSlideView style={{
                            marginLeft:0,
                            marginTop:0,
                            width:width,
                            height:height,
                        }} pageControlPosition={0} autoCycleDuration={6} arrData={section.title}>
                        </XCCycleSlideView>
                        <ScrollView style={{
                            flexDirection:'row',

                            marginLeft:0,
                            marginTop:0,
                            width:SCREEN_WIDTH,
                            height:TAGS_BUTTON_HEIGHT,

                            backgroundColor:'rgba(255,255,255,1)',
                        }}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}>
                            {this.renderTagButtons()}

                            <Image style={{
                                position:'absolute',
                                marginLeft:selectionBarOriginX,
                                marginTop:TAGS_BUTTON_HEIGHT - 3,
                                width:35,
                                height:3,
                            }} source={require('./images/LiveLobby/live_list_image_tag_be_selected_bar.png')}>
                            </Image>

                        </ScrollView>
                        <View style={{
                            marginLeft:0,
                            marginTop:0,
                            width:SCREEN_WIDTH,
                            height:ANCHOR_POST_GAP,

                            backgroundColor:'rgba(255,255,255,0)',
                        }}>
                        </View>
                    </View>
                );
            }
                break;

            case 1: {

                if (this.tagID.length != 0) {
                    // 选中 tag，显示"返回推荐"

                    let separatorWidth = (SCREEN_WIDTH - 72 - 27 * 2) / 2;
                    let onePixelHeight = 0.5;
                    if (IS_3X_DEVIDE) {
                        onePixelHeight = 1 / 3;
                    }

                    return (
                        <View style={{
                            flexDirection:'column',

                            marginLeft:0,
                            marginTop:0,
                            width:SCREEN_WIDTH,
                            height:123,
                        }}>
                            <TouchableOpacity style={{
                                marginLeft:(SCREEN_WIDTH - 100) / 2,
                                marginTop:18,
                                width:100,
                                height:32,

                                borderRadius:16,
                                overflow:'hidden',

                                backgroundColor:'rgba(255,255,255,1)',
                            }} onPress={this.backToRecButtonAction} activeOpacity={1}>
                                <Text style={{
                                    marginLeft:0,
                                    marginTop:10,
                                    width:100,
                                    height:14,

                                    color:'rgba(235,74,65,1)',
                                    fontSize:12,
                                    fontWeight:'normal',
                                    textAlign:'center',
                                }}>
                                    返回推荐
                                </Text>
                            </TouchableOpacity>

                            <View style={{
                                flexDirection:'row',

                                marginLeft:0,
                                marginTop:34,
                                width:SCREEN_WIDTH,
                                height:14,
                            }}>
                                <View style={{
                                    marginLeft:27,
                                    marginTop:7 - onePixelHeight,
                                    width:separatorWidth,
                                    height:onePixelHeight,

                                    backgroundColor:'rgba(204,204,204,1)',
                                }}>
                                </View>

                                <Text style={{
                                    marginLeft:0,
                                    marginTop:0,
                                    width:72,
                                    height:14,

                                    color:'rgba(51,51,51,1)',
                                    fontSize:13,
                                    fontWeight:'normal',
                                    textAlign:'center',
                                }}>
                                    精彩主播
                                </Text>

                                <View style={{
                                    marginLeft:0,
                                    marginTop:7 - onePixelHeight,
                                    width:separatorWidth,
                                    height:onePixelHeight,

                                    backgroundColor:'rgba(204,204,204,1)',
                                }}>
                                </View>
                            </View>

                        </View>
                    );
                } else {
                    // 未选中 tag，显示第二推广

                    if (section.title.length == 0) {
                        // 没有这种推广
                        return (
                            <View style={{
                                marginLeft:0,
                                marginTop:0,
                                width:SCREEN_WIDTH,
                                height:0,
                            }}>
                            </View>
                        );
                    } else {
                        width = SCREEN_WIDTH - ANCHOR_POST_GAP * 2;
                        height = Math.floor(75 / 361 * width);

                        return (
                            <View style={{
                                flexDirection:'column',

                                marginLeft:0,
                                marginTop:0,
                                width:SCREEN_WIDTH,
                                height:height + ANCHOR_POST_GAP,
                            }}>
                                <XCCycleSlideView style={{
                                    marginLeft:ANCHOR_POST_GAP,
                                    marginTop:0,
                                    width:width,
                                    height:height,

                                    borderRadius:4,
                                    overflow:'hidden',
                                }} pageControlPosition={1} autoCycleDuration={6} arrData={section.title}>
                                </XCCycleSlideView>
                            </View>
                        );
                    }
                }
            }
                break;

            case 2: {

                if (section.title.length == 0) {
                    // 没有这种推广
                    return (
                        <View style={{
                            marginLeft:0,
                            marginTop:0,
                            width:SCREEN_WIDTH,
                            height:0,
                        }}>
                        </View>
                    );
                } else {
                    width = SCREEN_WIDTH - ANCHOR_POST_GAP * 2;
                    height = Math.floor(75 / 361 * width);

                    return (
                        <View style={{
                            flexDirection:'column',

                            marginLeft:0,
                            marginTop:0,
                            width:SCREEN_WIDTH,
                            height:height + ANCHOR_POST_GAP,
                        }}>
                            <XCCycleSlideView style={{
                                marginLeft:ANCHOR_POST_GAP,
                                marginTop:0,
                                width:width,
                                height:height,

                                borderRadius:4,
                                overflow:'hidden',
                            }} pageControlPosition={1} autoCycleDuration={6} arrData={section.title}>
                            </XCCycleSlideView>
                        </View>
                    );
                }
            }
                break;

            case 3: {
                return (
                    <View style={{
                        flexDirection: 'row',

                        marginLeft: 0,
                        marginTop: 0,
                        width: SCREEN_WIDTH,
                        height: 50,

                        backgroundColor: 'rgba(255,255,255,1)',
                    }}>
                        <Image style={{
                            marginLeft: 12,
                            marginTop: 10,
                            width: 25,
                            height: 25,
                        }} source={require('./images/MiniVideo/live_lobby_hot_list_recommended_mini_video_icon.png')}>
                        </Image>

                        <Text style={{
                            marginLeft:7,
                            marginTop:15,
                            width:80,
                            height:15,

                            color:'rgba(51,51,51,1)',
                            fontSize:14,
                            fontWeight:'normal',
                            textAlign:'left',
                        }}>
                            小视频推荐
                        </Text>

                        <Text style={{
                            marginLeft:SCREEN_WIDTH - 20 - 30 - 80 - 7 - 25 - 15,
                            marginTop:15,
                            width:30,
                            height:15,

                            color:'rgba(153,153,153,1)',
                            fontSize:12,
                            fontWeight:'normal',
                            textAlign:'right',
                        }}>
                            更多
                        </Text>

                        <Image style={{
                            marginLeft: 4,
                            marginTop: 16,
                            width: 7,
                            height: 11,
                        }} source={require('./images/MiniVideo/live_list_icon_moreVoiceActor.png')}>
                        </Image>

                        <TouchableOpacity style={{
                            position:'absolute',

                            marginLeft:SCREEN_WIDTH / 2,
                            marginTop:0,
                            width:SCREEN_WIDTH / 2,
                            height:50,
                        }} onPress={this.miniVideoRecButtonAction} activeOpacity={1}>
                        </TouchableOpacity>
                    </View>
                );
            }
                break;

            case 4: {
            }
                break;

            default: {
            }
                break;
        }
    }

    renderTagButtons() {

        let arrButtons = [];

        for (let i = 0; i < this.arrMenuTags.length + 1; i++) {

            let marginLeft = 10;
            let tagID = '';
            let imgSource;

            let tagName;
            let textStyle;

            if (i != 0) {
                // 网络数据
                marginLeft = 14;
                tagID = this.arrMenuTags[i - 1].id;
                if (IS_3X_DEVIDE) {
                    imgSource = {uri: this.arrMenuTags[i - 1].viewPicNormal.img3x};
                } else {
                    imgSource = {uri: this.arrMenuTags[i - 1].viewPicNormal.img2x};
                }

                tagName = this.arrMenuTags[i - 1].name;
            } else {
                // 推荐（本地数据）
                imgSource = require('./images/LiveLobby/live_list_icon_recommendation_tag.png');

                tagName = '推荐';
            }

            if (i == this.state.selectedTagIndex) {
                // 选中

                textStyle = {
                    marginLeft:0,
                    marginTop:8,
                    width:60,
                    height:15,

                    color:'rgba(51,51,51,1)',
                    fontSize:13,
                    fontWeight:'normal',
                    textAlign:'center',
                };
            } else {
                // 未选中

                textStyle = {
                    marginLeft:0,
                    marginTop:10,
                    width:60,
                    height:12,

                    color:'rgba(102,102,102,1)',
                    fontSize:11,
                    fontWeight:'normal',
                    textAlign:'center',
                };
            }

            arrButtons.push(
                <TouchableOpacity style={{
                    flexDirection:'column',

                    marginLeft:marginLeft,
                    marginTop:0,
                    width:60,
                    height:TAGS_BUTTON_HEIGHT,
                }} onPress={this.tagsButtonAction.bind(this, tagID, tagName, i)} activeOpacity={1}>
                    <Image style={{
                        marginLeft:10,
                        marginTop:10,
                        width:40,
                        height:40,
                    }} source={imgSource}>
                    </Image>
                    <Text style={textStyle}>
                        {tagName}
                    </Text>
                </TouchableOpacity>
            );
        }

        //补齐右边边距
        let scrollWidth = 10 * 2 + (this.arrMenuTags.length + 1) * 60 + this.arrMenuTags.length * 14; // 边距10，宽60，间距14
        if (scrollWidth + 10 > SCREEN_WIDTH) {
            arrButtons.push(
                <View style={{
                    marginLeft:0,
                    marginTop:0,
                    width:10,
                    height:TAGS_BUTTON_HEIGHT,
                }}>
                </View>
            );
        }

        return arrButtons;
    }

    renderSectionCell(item, index) {
        if (this.state.isLoadingTags) {
            // 正在请求 tags

            let viewHeight;
            if (IS_5_8_DEVICE) {
                viewHeight = SCREEN_HEIGHT - 44 - 44 - 34 - 49 - Math.floor(105 / 375 * SCREEN_WIDTH) - TAGS_BUTTON_HEIGHT - ANCHOR_POST_GAP;
            } else {
                viewHeight = SCREEN_HEIGHT - 20 - 44 - 49 - Math.floor(105 / 375 * SCREEN_WIDTH) - TAGS_BUTTON_HEIGHT - ANCHOR_POST_GAP;
            }

            return (
                <View style={{
                    marginLeft:0,
                    marginTop:0,
                    width:SCREEN_WIDTH,
                    height:viewHeight,
                }}>
                    <ActivityIndicator
                        style={{
                            marginLeft:(SCREEN_WIDTH - 20) / 2,
                            marginTop:(viewHeight - 20) / 2,
                            width:20,
                            height:20,
                        }}
                        color="gray"
                        size="small"
                    />
                </View>
            );
        } else {
            if (this.tagID.length != 0 && this.arrLive.length == 0 && !item.lanchor) {
                // 选中了 tag 而直播列表为空，且是第一个section

                let viewHeight;
                if (IS_5_8_DEVICE) {
                    viewHeight = SCREEN_HEIGHT - 44 - 44 - 34 - 49 - Math.floor(105 / 375 * SCREEN_WIDTH) - TAGS_BUTTON_HEIGHT - ANCHOR_POST_GAP;
                } else {
                    viewHeight = SCREEN_HEIGHT - 20 - 44 - 49 - Math.floor(105 / 375 * SCREEN_WIDTH) - TAGS_BUTTON_HEIGHT - ANCHOR_POST_GAP;
                }

                return (
                    <View style={{
                        marginLeft:0,
                        marginTop:0,
                        width:SCREEN_WIDTH,
                        height:viewHeight,
                    }}>
                        <Image style={{
                            marginLeft:(SCREEN_WIDTH - 90) / 2,
                            marginTop:(viewHeight - 90) / 2,
                            width:90,
                            height:90,
                        }} source={require('./images/LiveLobby/live_list_icon_anchorEmpty.png')}>
                        </Image>
                    </View>
                );
            }
            if (item.lanchor) {
                // 常规直播数据

                if (item.ranchor) {
                    return (
                        <View style={styles.hotsLiveListCell}>
                            <AnchorPostDisplay dataDic={item.lanchor} arrTags={this.arrTags}>
                            </AnchorPostDisplay>
                            <AnchorPostDisplay dataDic={item.ranchor} arrTags={this.arrTags}>
                            </AnchorPostDisplay>
                        </View>
                    );
                } else {
                    return (
                        <View style={styles.hotsLiveListCell}>
                            <AnchorPostDisplay dataDic={item.lanchor} arrTags={this.arrTags}>
                            </AnchorPostDisplay>
                        </View>
                    );
                }
            } else if (item.lmini) {
                // 小视频数据

                let commonCellHeight = Math.ceil((SCREEN_WIDTH - ANCHOR_POST_GAP * 4) / 3 / 231 * 308) + 25 + 15;
                let lastCellHeight = commonCellHeight + 5 + 7;

                let isLastCell = false;

                if (this.arrMiniVideo.length % 3) {
                    if (index == Math.floor(this.arrMiniVideo.length / 3)) {
                        isLastCell = true;
                    }
                } else {
                    if (index == Math.floor(this.arrMiniVideo.length / 3) - 1) {
                        isLastCell = true;
                    }
                }

                if (!isLastCell) {
                    return (
                        <View style={{
                            flexDirection: 'row',

                            marginLeft: 0,
                            marginTop: 0,
                            width: SCREEN_WIDTH,
                            height: commonCellHeight,

                            backgroundColor: 'rgba(255,255,255,1)',
                        }}>
                            <MiniVideoDisplay dataDic={item.lmini}>
                            </MiniVideoDisplay>
                            <MiniVideoDisplay dataDic={item.cmini}>
                            </MiniVideoDisplay>
                            <MiniVideoDisplay dataDic={item.rmini}>
                            </MiniVideoDisplay>
                        </View>
                    );
                } else {
                    if (item.rmini) {
                        return (
                            <View style={{
                                flexDirection: 'column',

                                marginLeft: 0,
                                marginTop: 0,
                                width: SCREEN_WIDTH,
                                height: lastCellHeight,
                            }}>
                                <View style={{
                                    flexDirection: 'row',

                                    marginLeft: 0,
                                    marginTop: 0,
                                    width: SCREEN_WIDTH,
                                    height: lastCellHeight - 7,

                                    backgroundColor: 'rgba(255,255,255,1)',
                                }}>
                                    <MiniVideoDisplay dataDic={item.lmini}>
                                    </MiniVideoDisplay>
                                    <MiniVideoDisplay dataDic={item.cmini}>
                                    </MiniVideoDisplay>
                                    <MiniVideoDisplay dataDic={item.rmini}>
                                    </MiniVideoDisplay>
                                </View>
                            </View>
                        );
                    } else if (item.cmini) {
                        return (
                            <View style={{
                                flexDirection: 'column',

                                marginLeft: 0,
                                marginTop: 0,
                                width: SCREEN_WIDTH,
                                height: lastCellHeight,
                            }}>
                                <View style={{
                                    flexDirection: 'row',

                                    marginLeft: 0,
                                    marginTop: 0,
                                    width: SCREEN_WIDTH,
                                    height: lastCellHeight - 7,

                                    backgroundColor: 'rgba(255,255,255,1)',
                                }}>
                                    <MiniVideoDisplay dataDic={item.lmini}>
                                    </MiniVideoDisplay>
                                    <MiniVideoDisplay dataDic={item.cmini}>
                                    </MiniVideoDisplay>
                                </View>
                            </View>
                        );
                    } else {
                        return (
                            <View style={{
                                flexDirection: 'column',

                                marginLeft: 0,
                                marginTop: 0,
                                width: SCREEN_WIDTH,
                                height: lastCellHeight,
                            }}>
                                <View style={{
                                    flexDirection: 'row',

                                    marginLeft: 0,
                                    marginTop: 0,
                                    width: SCREEN_WIDTH,
                                    height: lastCellHeight - 7,

                                    backgroundColor: 'rgba(255,255,255,1)',
                                }}>
                                    <MiniVideoDisplay dataDic={item.lmini}>
                                    </MiniVideoDisplay>
                                </View>
                            </View>
                        );
                    }
                }
            }
        }
    }

    setRequestProps(props) {
        this.isInReview = props.rate == '10';
        if (props.uid) {
            this.uid = props.uid;
            this.encpass = props.encpass;
        }
        if (props.rand) {
            this.rand = props.rand;
        }

        if (this.isInReview) {
            this.requestPromotionsStatus = -1;
        } else {
            this.getPromotionsData();
        }
        this.getHotsLiveList();
    }

    setLoginProps(props) {
        this.uid = props.uid;
        this.encpass = props.encpass;
    }

    componentWillMount() {
        // 测试方法，发布删除
        this.getPromotionsData();
        this.getHotsLiveList();
    }

    tagsButtonAction(tagID, tagName, itemIndex) {

        console.log('id = ' + tagID + ', name = ' + tagName + ', index = ' + itemIndex);

        if (itemIndex == this.state.selectedTagIndex) {
            return;
        }

        // 如果两个请求中有一个仍在执行，不响应点击
        if (this.requestLiveStatus == 1 || this.requestPromotionsStatus == 1) {
            return;
        }

        this.setState({
            sections: [
                {key: 0, title: this.arrPromotions1, data: [{key: 'A'}]}, // 塞一个空数据
            ],

            selectedTagIndex: itemIndex,
            isLoadingTags: true,
        });

        this.tagID = tagID;

        this.requestPromotionsStatus = -1;
        this.getHotsLiveList();
    }

    miniVideoRecButtonAction() {
        this.rnCallNativeManager.rnCallNativeWithEvent('openMiniVideoRec', {});
    }

    backToRecButtonAction() {
        this.tagsButtonAction('', '推荐', 0);
    }

    requestFinishedSynchronizer() {

        // this.requestLiveStatus = 0; // -1、无需请求 0、未请求 1、请求中 2、请求完成 3、请求失败
        // this.requestPromotionsStatus = 0; // -1、无需请求 0、未请求 1、请求中 2、请求完成 3、请求失败

        // 如果两个请求中有一个仍在执行，直接return，等待下次调用
        if (this.requestLiveStatus == 1 || this.requestPromotionsStatus == 1) {
            return;
        }

        this._refPullDownRefreshView.showPullDownView(3);
        // this.mainList.scrollToOffset({animated: true, offset: 0});

        if (this.tagID.length != 0) {
            // 选中了 tag

            let arrSections = [];

            if (this.arrLive.length == 0) {
                // 选中的 tag 没有直播数据

                arrSections = [
                    {key: 0, title: this.arrPromotions1, data: [{key: 'A'}]},
                    {key: 1, title: [{key: 'B'}], data: this.formatLiveData(this.arrRec, this.recID, 'B')},
                ];
            } else {
                arrSections = [
                    {key: 0, title: this.arrPromotions1, data: this.formatLiveData(this.arrLive, this.recID, 'A')},
                    {key: 1, title: [{key: 'B'}], data: this.formatLiveData(this.arrRec, this.recID, 'B')},
                ];
            }

            this.setState({
                sections: arrSections,

                isLoadingTags: false,
            });
        } else {
            // 选择了"推荐" tag

            let arrSections = [];

            this.arrPromotions1 = [];
            let arrPromotions2 = [];
            let arrPromotions3 = [];

            let arrLive1 = [];
            let arrLive2 = [];
            let arrLive3 = [];
            let arrLive4 = [];

            // 先重组推广数据，决定分多少个section
            for (let i = 0; i < this.arrPromotions.length; i++) {
                let promotion = this.arrPromotions[i];
                if (promotion.type == 2) {
                    // promotion.append(key:'A' + this.arrPromotions1.length);
                    this.arrPromotions1.push(promotion);
                } else if (promotion.type == 1) {
                    // promotion.append(key:'B' + arrPromotions2.length);
                    arrPromotions2.push(promotion);
                } else if (promotion.type == 3) {
                    // promotion.append(key:'C' + arrPromotions3.length);
                    arrPromotions3.push(promotion);
                }
            }

            if (this.arrMiniVideo.length == 0) {
                this.arrMiniVideo = [
                    {
                        alias : '✿．嘉嘉嘉嘉嘉嘉嘉',
                avstar : 'https://vi2.6rooms.com/live/2015/10/31/18/1003v1446289065048297521.jpg',
                id : 1,
                pospic : 'https://vi3.6rooms.com/live/2018/01/29/10/1007v1517194285831383662_s.jpg',
                rid : 6218,
                title : '大力出奇迹',
                tm : 35,
                uid : 55629188,
            },
                {
                    alias : '长腿畅妹儿不忘初心',
                    avstar : 'https://vi1.6rooms.com/live/2018/01/20/16/1003v1516437527678296509.jpg',
                    id : 2,
                    pospic : 'https://vi0.6rooms.com/live/2018/01/20/16/1010v1516435273864984007_s.jpg',
                    rid : 726236,
                    title : '摩擦磨擦',
                    tm : 160,
                    uid : 76612134,
                },
                {
                    alias : '代理温唇充值⑥币即返',
                    avstar : 'https://vi2.6rooms.com/live/2017/08/01/09/1003v1501552768359612778.jpg',
                    id : 3,
                    pospic : 'https://vi3.6rooms.com/live/2017/01/13/23/1010v1484322603368635529_s.jpg',
                    rid : 9998,
                    title : '这狗成精了',
                    tm : 24,
                    uid : 53915232,
                },
                {
                    alias : '依诺♔小蛮腰大长腿',
                    avstar : 'https://vi3.6rooms.com/live/2016/06/01/14/1003v1464762358720321773.jpg',
                    id : 4,
                    pospic : 'https://vi1.6rooms.com/live/2017/06/17/20/1010v1497703693554248689_s.jpg',
                    rid : 191111,
                    title : '滋味鲜美',
                    tm : 33,
                    uid : 63213382,
                },
                {
                    alias : '一只小白兔啊',
                    avstar : 'https://vi3.6rooms.com/live/2017/11/30/09/1003v1512004123563566163.jpg',
                    id : 5,
                    pospic : 'https://vi2.6rooms.com/live/2018/01/29/09/1007v1517188733690972079_s.jpg',
                    rid : 816340,
                    title : '一见你就笑',
                    tm : 65,
                    uid : 63162367,
                },
                {
                    alias : '♪美少女♪萌嘟嘟',
                    avstar : 'https://vi2.6rooms.com/live/2018/01/28/19/1003v1517137489972427447.jpg',
                    id : 6,
                    pospic : 'https://vi1.6rooms.com/live/2018/01/29/08/1007v1517187093054616892_s.jpg',
                    rid : 849137,
                    title : '这个社会真变了，狗狗也摇起来',
                    tm : 45,
                    uid : 69804491,
                }

            ];
            }

            if (this.arrLive.length <= FIRST_SECTION_COUNT) {
                arrLive1 = this.formatLiveData(this.arrLive, this.recID, 'A');
            } else if (this.arrLive.length <= SECOND_SECTION_COUNT) {
                arrLive1 = this.formatLiveData(this.arrLive.slice(0, FIRST_SECTION_COUNT), this.recID, 'A');
                arrLive2 = this.formatLiveData(this.arrLive.slice(FIRST_SECTION_COUNT), this.recID, 'B');
            } else {
                arrLive1 = this.formatLiveData(this.arrLive.slice(0, FIRST_SECTION_COUNT), this.recID, 'A');
                arrLive2 = this.formatLiveData(this.arrLive.slice(FIRST_SECTION_COUNT, FIRST_SECTION_COUNT + SECOND_SECTION_COUNT), this.recID, 'B');
                arrLive3 = this.formatMiniVideoData(this.arrMiniVideo, 'C');
                arrLive4 = this.formatLiveData(this.arrLive.slice(FIRST_SECTION_COUNT + SECOND_SECTION_COUNT), this.recID, 'D');
            }

            arrSections = [
                {key: 0, title: this.arrPromotions1, data: arrLive1},
                {key: 1, title: arrPromotions2, data: arrLive2},
                {key: 2, title: arrPromotions3, data: []},
                {key: 3, title: [{key: 'D'}], data: arrLive3},
                {key: 4, title: [{key: 'E'}], data: arrLive4},
            ];

            this.setState({
                sections: arrSections,

                isLoadingTags: false,
            });
        }
    }

    getPromotionsData() {
        // console.log('********************************getPromotionsData');

        if (this.requestPromotionsStatus == 1) {
            return;
        }
        this.requestPromotionsStatus = 1;

        let requestParams = new FormData();
        requestParams.append('av', this.props.av);

        if (this.uid.length != 0) {
            requestParams.append('logiuid', this.uid);
            requestParams.append('encpass', this.encpass);
        }

        fetch('https://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getEventList.php', {
            method: 'POST',

            headers: {
                'Accept-Language' : 'zh-Hans-CN;q=1, en-US;q=0.9, ar-CN;q=0.8, bg-BG;q=0.7',
                'Content-Type' : 'application/x-www-form-urlencoded; charset=utf-8',
                'User-Agent' : 'jY4xDsIwEAQ)hKO9s3126IyU1PwgutiGuEkKhEThxwMdJdK0M5pXe(ZN9)vSjsdIZBc)jAN3wewdhAzFiY0jm0yMF2uQphStzNG71Nt1O)ZKOHH)qp06gwIiiK0LnkooqgJZxa(wn5wEsIrTIJkzB81ewFVumZ2WXDv4DPzy18cb',
            },

            body: requestParams,
        })
            .then((response) => response.json())
            .then((responseJson) => {

                // console.log('********************************succeed');
                // console.log(responseJson);

                let promotionsList = responseJson.content;
                if (promotionsList.length == 0) {
                    // 请求得到空数据

                    this.requestPromotionsStatus = 3;
                    this.requestFinishedSynchronizer();
                } else {
                    // 请求得到正常数据

                    this.arrPromotions = promotionsList;

                    this.requestPromotionsStatus = 2;
                    this.requestFinishedSynchronizer();
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getHotsLiveList() {
        // console.log('********************************getHotsLiveList');

        if (this.requestLiveStatus == 1) {
            return;
        }
        this.requestLiveStatus = 1;

        let requestParams = new FormData();
        requestParams.append('size', '0');
        requestParams.append('p', '0');
        requestParams.append('av', this.props.av);
        requestParams.append('type', '');

        requestParams.append('tagId', this.tagID);
        requestParams.append('tagIdEvent', 'click');

        if (this.uid.length != 0) {
            requestParams.append('logiuid', this.uid);
            requestParams.append('encpass', this.encpass);
        }

        if (this.isInReview) {
            requestParams.append('rate', '10');
            requestParams.append('rand', this.rand);
        } else {
            requestParams.append('rate', '100');
        }

        this.timeDate = (new Date()).valueOf();

        fetch('https://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getlivelistnew.php', {
            method: 'POST',

            headers: {
                // 'Accept': 'application/json',
                // 'Content-Type': 'application/json',
            },

            body: requestParams,
        })
            .then((response) => response.json())
            .then((responseJson) => {

                let roomList = responseJson.content.roomList;

                if (this.arrLive.length == 0) {
                    // 当前无直播数据，表明这是第一次请求

                    if (roomList.length == 0) {
                        // 请求得到空数据

                        this.retryCount ++;

                        if (this.retryCount > RETRY_COUNT_LIMIT) {

                            this.retryCount = 0;

                            this.requestLiveStatus = 3;
                            Alert.alert(
                                '网络不稳定',
                                '连接服务器超时，请检查您的网络是否可用',
                                [{text: '重试', onPress: () => this.getHotsLiveList(), style: 'cancel'},],
                            );
                        } else {

                            this.requestLiveStatus = 3;
                            this.getHotsLiveList();
                            return;
                        }
                    } else {
                        // 请求得到正常数据

                        this.arrLive = roomList;
                        if (responseJson.content.recTagList) {
                            this.arrRec = responseJson.content.recTagList;
                        }
                        if (responseJson.content.shortViedeo) {
                            this.arrMiniVideo = responseJson.content.shortViedeo;
                        }
                        this.arrTags = responseJson.content.tagInfo;
                        this.arrMenuTags = [];
                        for (let i = 0; i < this.arrTags.length; i++) {
                            let dicTag = this.arrTags[i];
                            if (dicTag.count != 0) {
                                this.arrMenuTags.push(dicTag);
                            }
                        }
                        this.recID = responseJson.content.recid;

                        this.requestLiveStatus = 2;
                        this.requestFinishedSynchronizer();

                        // 向原生发送大厅加载完成的通知
                        this.rnCallNativeManager.rnCallNativeWithEvent('lobbyListLoadFinish', {});
                    }
                } else {
                    // 并非首次请求

                    if (roomList.length == 0) {
                        // 请求得到空数据

                        this.requestLiveStatus = 3;
                        this.requestFinishedSynchronizer();

                    } else {
                        // 请求得到正常数据

                        this.arrLive = roomList;
                        if (responseJson.content.recTagList) {
                            this.arrRec = responseJson.content.recTagList;
                        }
                        if (responseJson.content.shortViedeo) {
                            this.arrMiniVideo = responseJson.content.shortViedeo;
                        }
                        this.arrTags = responseJson.content.tagInfo;
                        this.arrMenuTags = [];
                        for (let i = 0; i < this.arrTags.length; i++) {
                            let dicTag = this.arrTags[i];
                            if (dicTag.count != 0) {
                                this.arrMenuTags.push(dicTag);
                            }
                        }
                        this.recID = responseJson.content.recid;

                        this.requestLiveStatus = 2;
                        this.requestFinishedSynchronizer();
                    }
                }

                // console.log('********************************succeed');
                // console.log(responseJson);
            })
            .catch((error) => {
                console.error(error);

                if (this.arrLive.length == 0) {
                    // 当前无直播数据，表明这是第一次请求

                    if (this.retryCount > RETRY_COUNT_LIMIT) {

                        this.retryCount = 0;
                        Alert.alert(
                            '网络不稳定',
                            '连接服务器超时，请检查您的网络是否可用',
                            [{text: '重试', onPress: () => this.getHotsLiveList(), style: 'cancel'},],
                        );
                    } else {

                        this.getHotsLiveList();
                        return;
                    }
                } else {
                    // 并非首次请求
                    this.requestLiveStatus = 3;
                    this.requestFinishedSynchronizer();
                }
            });
    }

    formatLiveData(responseJson, recID, key) {

        let array = [];

        let row = Math.floor(responseJson.length / 2);
        let hasSingleTail = false;
        if (responseJson.length % 2) {
            row++;
            hasSingleTail = true;
        };

        for (let i = 0; i < row; i++) {

            let data = {};

            if (i == row - 1 && hasSingleTail) {
                data = {
                    lanchor: {
                        uid: responseJson[i*2].uid,
                        rid: responseJson[i*2].rid,
                        pospic: responseJson[i*2].pospic,
                        flvTitle: responseJson[i*2].flvtitle,
                        videoType: responseJson[i*2].videotype,

                        pos: i*2+1,
                        recID: recID,
                        recModule: 'index',

                        username: responseJson[i*2].username,
                        count: responseJson[i*2].count,
                        tagids: responseJson[i*2].tagids,
                    },
                    key: key+i,
                };
            } else {
                data = {
                    lanchor: {
                        uid: responseJson[i*2].uid,
                        rid: responseJson[i*2].rid,
                        pospic: responseJson[i*2].pospic,
                        flvTitle: responseJson[i*2].flvtitle,
                        videoType: responseJson[i*2].videotype,

                        pos: i*2+1,
                        recID: recID,
                        recModule: 'index',

                        username: responseJson[i*2].username,
                        count: responseJson[i*2].count,
                        tagids: responseJson[i*2].tagids,
                    },
                    ranchor: {
                        uid: responseJson[i*2+1].uid,
                        rid: responseJson[i*2+1].rid,
                        pospic: responseJson[i*2+1].pospic,
                        flvTitle: responseJson[i*2+1].flvtitle,
                        videoType: responseJson[i*2+1].videotype,

                        pos: i*2+2,
                        recID: recID,
                        recModule: 'index',

                        username: responseJson[i*2+1].username,
                        count: responseJson[i*2+1].count,
                        tagids: responseJson[i*2+1].tagids,
                    },
                    key: key+i,
                };
            }

            array.push(data);
        };

        return array;
    }

    formatMiniVideoData(responseJson, key) {

        let array = [];

        let row = Math.floor(responseJson.length / 3);
        let hasSingleTail = false;
        if (responseJson.length % 3) {
            row++;
            hasSingleTail = true;
        };

        for (let i = 0; i < row; i++) {

            let data = {};

            if (i == row - 1 && hasSingleTail) {

                if (3 * row - responseJson.length == 2) {
                    // 差2个，也就是只有1个
                    data = {
                        lmini: responseJson[i * 3],
                        key: key+i,
                    };
                } else if (3 * row - responseJson.length == 1) {
                    // 差1个，也就是有2个
                    data = {
                        lmini: responseJson[i * 3],
                        cmini: responseJson[i * 3 + 1],
                        key: key+i,
                    };
                }
            } else {
                data = {
                    lmini: responseJson[i * 3],
                    cmini: responseJson[i * 3 + 1],
                    rmini: responseJson[i * 3 + 2],
                    key: key+i,
                };
            }

            array.push(data);
        };

        return array;
    }

    //flatlist 滑动的 delegate
    mainScrollViewOnScroll(offsetY) {
        this._refPullDownRefreshView.judgeScrollState(offsetY, this.isTouchPullDown);
        this.mainListoffsetY = offsetY;
    }

    //触摸结束抬起
    _onReleaseMouse() {
        this.isTouchPullDown = false;

        if (this.mainListoffsetY < -44) {
            // this.mainList.scrollToOffset({animated: true, offset: -44});

            this._refPullDownRefreshView.showPullDownView(2);

        }
    }

    //开始触摸屏幕
    _onStartTouch() {
        this.isTouchPullDown = true;
        this._refPullDownRefreshView.showPullDownView(0);
    }

    autoRefresh() {
        let nowTime = (new Date()).valueOf();
        let diff = nowTime - this.timeDate;

        if (diff > this.props.refreshInterval) {
            console.log(this.timeDate);

            // this.mainList.scrollToOffset({animated: true, offset: -44});
            this._refPullDownRefreshView.showPullDownView(2);
        }
    }
}

const styles = StyleSheet.create({

    hotsLiveListContainer: {
        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
        height:SCREEN_HEIGHT,
    },

    hotsLiveList: {
        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
        height:SCREEN_HEIGHT,
    },

    hotsLiveListHeader2: {
        flexDirection:'row',

        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
        height:(105 / 375 * SCREEN_WIDTH) + 78,

        backgroundColor:'rgba(0,255,0,1)',
    },

    hotsLiveListHeader3: {
        flexDirection:'row',

        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
        height:(105 / 375 * SCREEN_WIDTH) + 78,

        backgroundColor:'rgba(0,0,255,1)',
    },

    hotsLiveListCell: {
        flexDirection:'row',

        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
        height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 + 36 + ANCHOR_POST_GAP,
    },

    // hotsLiveListCellItem: {
    //     marginLeft:ANCHOR_POST_GAP,
    //     marginTop:0,
    //     width:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2,
    //     height:(SCREEN_WIDTH - ANCHOR_POST_GAP * 3) / 2 + 36,
    // },

    sectionListHeader: {
        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
        height:64,
    },

    sectionListFooter: {
        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
        height:49,
    },
});
