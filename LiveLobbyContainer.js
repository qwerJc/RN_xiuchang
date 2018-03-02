import React, {Component} from 'react';

import {
    ActivityIndicator,
    Animated,// 可选的基本组件类型: Image, Text, View
    AppRegistry,
    Dimensions,
    Easing,
    Image,
    InteractionManager,
    NativeModules,
    SectionList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import HotsLiveList from './HotsLiveList.js';
import Universal from './Universal.js';
import GoodVoice from './GoodVoice';
import Vicinity  from './Vicinity';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const IS_5_8_DEVICE = Dimensions.get('window').height == 812;

const UNIVERSAL_PAGE_GAP = 10;

const HEAD_BAR_MENU_BUTTON_GAP = 17;
const HEAD_BAR_MENU_BUTTON_LONGER = 2;
const HEAD_BAR_MENU_BUTTON_FONT = 14;

const LIST_MENU_BUTTON_WIDTH = 68;
const LIST_MENU_SINGLE_ROW_BUTTON_COUNT = 4;

const LIVE_LOBBY_VERSION = '2.8';
const REFRESH_INTERVAL = 180000;

class LiveLobbyContainer extends Component {
    constructor(props: any) {

        super(props);

        this.rnCallNativeManager = NativeModules.RNCallNativeManager; // rn 向 native 发送通知

        this.mainScrollView;
        this.headBarMenuScrollView;
        this.headBarMenuSelectionBar;
        this.listMenuSectionList;

        // 各个分页面
        this.hotsLiveList;
        this.vicinityLiveList;
        this.goodVoiceLiveList;
        this.danceLiveList;
        this.funLiveList;
        this.chatLiveList;
        this.maleLiveList;
        this.miniVideoLiveList;
        this.mobileLiveList;
        this.shopLiveList;

        this.headBarMenuButtonOriginXs = [];
        this.headBarMenuContentSizeWidth = 0;

        this.isShowingMenu = false;

        this.listMenuDic = {
            up: [
                {title:'热门', pic:require('./images/LiveLobby/live_list_menu_button_live_hot.png'), isZone:1},
                {title:'附近', pic:require('./images/LiveLobby/live_list_menu_button_live_local.png'), isZone:1},
                {title:'好声音', pic:require('./images/LiveLobby/live_list_menu_button_live_song.png'), isZone:1},
                {title:'舞蹈', pic:require('./images/LiveLobby/live_list_menu_button_live_dance.png'), isZone:1},
                {title:'搞笑', pic:require('./images/LiveLobby/live_list_menu_button_live_fun.png'), isZone:1},
                {title:'唠嗑', pic:require('./images/LiveLobby/live_list_menu_button_live_chat.png'), isZone:1},
                {title:'男神', pic:require('./images/LiveLobby/live_list_menu_button_live_male.png'), isZone:1},
                {title:'小视频', pic:require('./images/MiniVideo/live_lobby_menu_icon_mini_video.png'), isZone:1},
                {title:'手机红人', pic:require('./images/LiveLobby/live_list_menu_button_live_mobile.png'), isZone:1},
                {title:'商铺', pic:require('./images/LiveLobby/live_list_menu_button_live_shops.png'), isZone:1},
                {title:'六现场', pic:require('./images/LiveLobby/live_list_menu_button_live_6xianchang.png'), isZone:0},
            ],
            down: [
                {title: '炽星', pic: require('./images/LiveLobby/live_list_menu_button_live_blazing_star.png')},
                {title: '超星', pic: require('./images/LiveLobby/live_list_menu_button_live_super_star.png')},
                {title: '巨星', pic: require('./images/LiveLobby/live_list_menu_button_live_big_star.png')},
                {title: '明星', pic: require('./images/LiveLobby/live_list_menu_button_live_star.png')},
                {title: '红人', pic: require('./images/LiveLobby/live_list_menu_button_live_little_star.png')},
            ],
        };

        this.state = {
            isLoading: true,

            selectedIndex: 0,
            selectedSongIndex: 9,

            zoneTitles: ['热门', '附近', '好声音', '舞蹈', '搞笑', '唠嗑', '男神', '小视频', '手机红人', '商铺'],
            extraTitles: ['六现场'],

            menuButtonFirstBarOriginY: new Animated.Value(0),
            menuButtonThirdBarOriginY: new Animated.Value(0),

            menuButtonSecondBarOpacity: new Animated.Value(1),

            menuButtonFirstBarRotateZ: new Animated.Value(0),
            menuButtonThirdBarRotateZ: new Animated.Value(0),

            listMenuContainerHeight: new Animated.Value(0),
            listMenuContainerOpacity: new Animated.Value(0),

            listMenuSections: [
                {key: 0, data: [{section: 0, key: 'A'}]},
                {key: 1, data: [{section: 1, key: 'B'}]},
            ],
        };

        this.showSearchButtonAction = this.showSearchButtonAction.bind(this);
        this.menuButtonAction = this.menuButtonAction.bind(this);
        this.showListMenu = this.showListMenu.bind(this);
        this.hideListMenu = this.hideListMenu.bind(this);
    }

    render() {
        console.disableYellowBox = true;
        // console.ignoredYellowBox = ['Warning: setState(...)'];

        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={{
                    flexDirection: 'row',

                    marginLeft:0,
                    marginTop:0,
                    width:(SCREEN_WIDTH + UNIVERSAL_PAGE_GAP) * 10,
                    height:SCREEN_HEIGHT,
                }}
                            ref={(refMainScrollView) => {
                                this.mainScrollView = refMainScrollView
                            }}
                            scrollEventThrottle={16}
                            onScroll={(event) => this.mainScrollViewOnScroll(event.nativeEvent.contentOffset.x)}
                            onMomentumScrollEnd={(event) => this.mainScrollViewScrollEnd(event.nativeEvent.contentOffset.x)}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled={true}>
                    <HotsLiveList style={styles.hotsPage}
                                  av={LIVE_LOBBY_VERSION}
                                  refreshInterval={REFRESH_INTERVAL}
                                  ref={(refHotsLiveList) => {
                                      this.hotsLiveList = refHotsLiveList
                                  }}>

                    </HotsLiveList>

                    <View style={styles.otherPage}>
                        <Vicinity av={LIVE_LOBBY_VERSION}
                                  refreshInterval={REFRESH_INTERVAL}
                                  ref={(refVicinityLiveList) => {
                            this.vicinityLiveList = refVicinityLiveList
                        }}/>
                    </View>

                    <View style={styles.otherPage}>
                        <GoodVoice av = {LIVE_LOBBY_VERSION}
                                   refreshInterval={REFRESH_INTERVAL}
                                   liveLobbyContainerCallback={(index) => this.goodVoiceCallback(index)}
                                   ref={(refGoodVoiceLiveList) => {
                            this.goodVoiceLiveList = refGoodVoiceLiveList
                        }}/>
                    </View>

                    <View style={styles.otherPage}>
                        <Universal type='u1'
                                   av = {LIVE_LOBBY_VERSION}
                                   refreshInterval={REFRESH_INTERVAL}
                                   ref={(refDanceLiveList) => {
                            this.danceLiveList = refDanceLiveList
                        }}
                        />
                    </View>

                    <View style={styles.otherPage}>
                        <Universal type='u2'
                                   av = {LIVE_LOBBY_VERSION}
                                   refreshInterval={REFRESH_INTERVAL}
                                   ref={(refFunLiveList) => {
                            this.funLiveList = refFunLiveList
                        }}
                        />
                    </View>

                    <View style={styles.otherPage}>
                        <Universal type='u3'
                                   av = {LIVE_LOBBY_VERSION}
                                   refreshInterval={REFRESH_INTERVAL}
                                   ref={(refChatLiveList) => {
                            this.chatLiveList = refChatLiveList
                        }}
                        />
                    </View>

                    <View style={styles.otherPage}>
                        <Universal type='male'
                                   av = {LIVE_LOBBY_VERSION}
                                   refreshInterval={REFRESH_INTERVAL}
                                   ref={(refMaleLiveList) => {
                            this.maleLiveList = refMaleLiveList
                        }}
                        />
                    </View>

                    <View style={styles.otherPage}>
                        <Universal type='male'
                                   av = {LIVE_LOBBY_VERSION}
                                   refreshInterval={REFRESH_INTERVAL}
                                   ref={(refMiniVideoLiveList) => {
                            this.miniVideoLiveList = refMiniVideoLiveList
                        }}
                        />
                    </View>

                    <View style={styles.otherPage}>
                        <Universal type='mlive'
                                   av = {LIVE_LOBBY_VERSION}
                                   refreshInterval={REFRESH_INTERVAL}
                                   ref={(refMobileLiveList) => {
                            this.mobileLiveList = refMobileLiveList
                        }}
                        />
                    </View>

                    <View style={styles.otherPage}>
                        <Universal type='u7'
                                   av = {LIVE_LOBBY_VERSION}
                                   refreshInterval={REFRESH_INTERVAL}
                                   ref={(refShopLiveList) => {
                            this.shopLiveList = refShopLiveList
                        }}
                        />
                    </View>

                </ScrollView>
                {this.renderHeadBar()}
                {this.renderListMenu()}
            </View>
        );
    }

    renderHeadBar() {
        if (IS_5_8_DEVICE) {
            return (
                <View style={{
                    position: 'absolute',

                    marginLeft: 0,
                    marginTop: 0,
                    width: SCREEN_WIDTH,
                    height: 88,

                    backgroundColor: 'rgba(217,53,41,0.95)',
                }}>
                    <View style={{
                        marginLeft: 0,
                        marginTop: 44,
                        width: SCREEN_WIDTH,
                        height: 44,
                    }}>

                        {this.renderHeadBarContent()}

                    </View>
                </View>
            );
        } else {
            return (
                <View style={{
                    position: 'absolute',

                    marginLeft: 0,
                    marginTop: 0,
                    width: SCREEN_WIDTH,
                    height: 64,

                    backgroundColor: 'rgba(217,53,41,0.95)',
                }}>
                    <View style={{
                        marginLeft: 0,
                        marginTop: 20,
                        width: SCREEN_WIDTH,
                        height: 44,
                    }}>

                        {this.renderHeadBarContent()}

                    </View>
                </View>
            );
        }
    }

    renderHeadBarContent() {
        return (
            <View style={styles.headBarContent}>
                <TouchableOpacity style={styles.searchButton} onPress={this.showSearchButtonAction} activeOpacity={0.5}>
                    <Image style={styles.searchImage}
                           source={require('./images/LiveLobby/live_list_button_show_search_normal.png')}>
                    </Image>
                </TouchableOpacity>

                {this.renderHeadBarMenu()}

                <TouchableOpacity style={styles.menuButton} onPress={this.menuButtonAction} activeOpacity={1}>
                    <Animated.View style={{
                        position: 'absolute',

                        marginLeft: 12,
                        marginTop: 14.5,
                        width: 20,
                        height: 1.5,

                        backgroundColor: 'rgba(255,255,255,1)',

                        transform: [
                            {
                                translateY: this.state.menuButtonFirstBarOriginY,
                            },
                            {
                                rotateZ: this.state.menuButtonFirstBarRotateZ.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '360deg'],
                                }),
                            },
                        ],
                    }}>
                    </Animated.View>

                    <Animated.View style={{
                        position: 'absolute',

                        marginLeft: 12,
                        marginTop: 21.5,
                        width: 20,
                        height: 1.5,

                        backgroundColor: 'rgba(255,255,255,1)',

                        opacity: this.state.menuButtonSecondBarOpacity,
                    }}>
                    </Animated.View>

                    <Animated.View style={{
                        position: 'absolute',

                        marginLeft: 12,
                        marginTop: 28.5,
                        width: 20,
                        height: 1.5,

                        backgroundColor: 'rgba(255,255,255,1)',

                        transform: [
                            {
                                translateY: this.state.menuButtonThirdBarOriginY,
                            },
                            {
                                rotateZ: this.state.menuButtonThirdBarRotateZ.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '360deg'],
                                }),
                            },
                        ],
                    }}>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    }

    renderHeadBarMenu() {
        return (
            <View style={styles.headBarMenuContainer}>
                <ScrollView style={{
                    flexDirection: 'row',

                    marginLeft: 0,
                    marginTop: 0,
                    width: SCREEN_WIDTH - 46 - 44,
                    height: 44,
                }}
                            ref={(refHeadBarMenuScrollView) => {
                                this.headBarMenuScrollView = refHeadBarMenuScrollView
                            }}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}>
                    {this.renderHeadBarMenuButtons()}

                    <View style={{
                        position: 'absolute',

                        marginLeft: 2,
                        marginTop: 32,
                        width: HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[0].length,
                        height: 2,

                        backgroundColor: 'rgba(255,255,255,1)',
                    }}
                          ref={(refHeadBarMenuSelectionBar) => {
                              this.headBarMenuSelectionBar = refHeadBarMenuSelectionBar
                          }}>

                    </View>
                </ScrollView>
            </View>
        );
    }

    renderHeadBarMenuButtons() {

        this.headBarMenuButtonOriginXs = [];

        let arrButtons = [];
        let sumLen = this.state.zoneTitles.length + this.state.extraTitles.length;

        let originX = 0; // 各个按钮起始位置
        let contentSizeWidth = 0; // 顶部菜单滚动条全长

        for (let i = 0; i < sumLen; i++) {

            let buttonLeftMargin = HEAD_BAR_MENU_BUTTON_GAP;
            if (i == 0) {
                buttonLeftMargin = 0;
            }

            let isZone = false;
            let buttonTitle = '';

            if (i < this.state.zoneTitles.length) {
                isZone = true;
                buttonTitle = this.state.zoneTitles[i];
            } else {
                isZone = false;
                buttonTitle = this.state.extraTitles[i - this.state.zoneTitles.length];
            }

            let buttonWidth = buttonTitle.length * HEAD_BAR_MENU_BUTTON_FONT + HEAD_BAR_MENU_BUTTON_LONGER * 2;
            contentSizeWidth += buttonLeftMargin + buttonWidth;

            if (i < this.state.zoneTitles.length) {
                originX += buttonLeftMargin;
                this.headBarMenuButtonOriginXs.push(originX);
                originX += buttonWidth;
            }

            arrButtons.push(
                <TouchableOpacity style={{
                    marginLeft: buttonLeftMargin,
                    marginTop: 0,
                    width: buttonWidth,
                    height: 44,
                }} onPress={this.headBarMenuButtonAction.bind(this, i, buttonTitle, isZone)} activeOpacity={1}>
                    <Text style={{
                        marginLeft: 0,
                        marginTop: 14,
                        width: buttonWidth,
                        height: 30,

                        color: 'rgba(255,255,255,1)',
                        fontSize: HEAD_BAR_MENU_BUTTON_FONT,
                        fontWeight: 'normal',
                        textAlign: 'center',
                    }}>
                        {buttonTitle}
                    </Text>
                </TouchableOpacity>
            );
        }

        this.headBarMenuContentSizeWidth = contentSizeWidth;

        return arrButtons;
    }

    renderListMenu() {

        let menuMarginTop = 0;
        if (IS_5_8_DEVICE) {
            menuMarginTop = 108;
        } else {
            menuMarginTop = 64;
        }

        let menuHeight = 0;
        if (SCREEN_HEIGHT >= 568) {
            menuHeight = 423;
        } else {
            menuHeight = SCREEN_HEIGHT - 64 - 49;
        }

        return (
            <Animated.View style={{
                position: 'absolute',

                marginLeft: 0,
                marginTop: 0,
                width: SCREEN_WIDTH,
                height: this.state.listMenuContainerHeight,

                opacity: this.state.listMenuContainerOpacity,

                overflow: 'hidden',
            }}>
                <TouchableOpacity style={styles.listMenuBGButton} onPress={this.hideListMenu} activeOpacity={1}>
                </TouchableOpacity>

                <View style={{
                    position: 'absolute',

                    marginLeft: 0,
                    marginTop: menuMarginTop,
                    width: SCREEN_WIDTH,
                    height: menuHeight,

                    backgroundColor: 'rgba(255,255,255,1)',
                }}>
                    <SectionList
                        style={{
                            marginLeft: 0,
                            marginTop: 0,
                            width: SCREEN_WIDTH,
                            height: menuHeight,
                        }}
                        ref={(refListMenuSectionList) => {
                            this.listMenuSectionList = refListMenuSectionList
                        }}
                        stickySectionHeadersEnabled={true}
                        refreshing={false}
                        numColumns={1}
                        sections={this.state.listMenuSections}
                        renderSectionHeader={
                            ({section}) => this.renderListMenuSectionHeader(section)
                        }
                        renderItem={
                            ({item, index}) => this.renderListMenuSectionCell(item, index)
                        }
                    />
                </View>
            </Animated.View>
        );
    }

    renderListMenuSectionHeader(section) {
        let title = '';
        switch (section.key) {
            case 0: {
                title = '按表演类型分类';
            }
                break;

            case 1: {
                title = '按主播等级分类';
            }
                break;

            default: {
            }
                break;
        }

        return (
            <View style={{
                marginLeft: 0,
                marginTop: 0,
                width: SCREEN_WIDTH,
                height: 44,

                backgroundColor: 'rgba(255,255,255,1)',
            }}>
                <Text style={{
                    marginLeft: 10,
                    marginTop: 14,
                    width: 120,
                    height: 16,

                    color: 'rgba(146,146,146,1)',
                    fontSize: 14,
                    fontWeight: 'normal',
                    textAlign: 'left',
                }}>
                    {title}
                </Text>

                <View style={{
                    position: 'absolute',

                    marginLeft: 0,
                    marginTop: 43.5,
                    width: SCREEN_WIDTH,
                    height: 0.5,

                    backgroundColor: 'rgba(220,220,220,1)',
                }}>
                </View>
            </View>
        );
    }

    renderListMenuSectionCell(item, index) {

        let cellHeight = 0;
        let gap = (SCREEN_WIDTH - LIST_MENU_BUTTON_WIDTH * LIST_MENU_SINGLE_ROW_BUTTON_COUNT) / 8;

        switch (item.section) {
            case 0: {
                let row = Math.floor(this.listMenuDic.up.length / LIST_MENU_SINGLE_ROW_BUTTON_COUNT);
                if (this.listMenuDic.up.length % LIST_MENU_SINGLE_ROW_BUTTON_COUNT) {
                    row++;
                }

                cellHeight = LIST_MENU_BUTTON_WIDTH * row + gap * (2 + (row - 1) * 2);
            }
                break;

            case 1: {
                let row = Math.floor(this.listMenuDic.down.length / LIST_MENU_SINGLE_ROW_BUTTON_COUNT);
                if (this.listMenuDic.down.length % LIST_MENU_SINGLE_ROW_BUTTON_COUNT) {
                    row++;
                }

                cellHeight = LIST_MENU_BUTTON_WIDTH * row + gap * (2 + (row - 1) * 2);
            }
                break;

            default: {
            }
                break;
        }

        return (
            <View style={{
                marginLeft: 0,
                marginTop: 0,
                width: SCREEN_WIDTH,
                height: cellHeight,
            }}>
                {this.renderListMenuButtons(item.section)}
            </View>
        );
    }

    renderListMenuButtons(pos) {

        let arrSources = [];
        let arrButtons = [];
        let gap = (SCREEN_WIDTH - LIST_MENU_BUTTON_WIDTH * LIST_MENU_SINGLE_ROW_BUTTON_COUNT) / 8;

        if (pos == 0) {
            arrSources = this.listMenuDic.up;
        } else {
            arrSources = this.listMenuDic.down;
        }

        for (let i = 0; i < arrSources.length; i++) {

            let x = gap + (LIST_MENU_BUTTON_WIDTH + gap * 2) * (i % LIST_MENU_SINGLE_ROW_BUTTON_COUNT);
            let y = gap + (LIST_MENU_BUTTON_WIDTH + gap * 2) * Math.floor(i / LIST_MENU_SINGLE_ROW_BUTTON_COUNT);

            let bgColor = 'rgba(255,255,255,1)';
            if (pos == 0) {
                if (this.state.selectedIndex == i) {
                    bgColor = 'rgba(240,240,240,1)';
                }
            } else {
                if (this.state.selectedIndex == 2 && this.state.selectedSongIndex == i) {
                    bgColor = 'rgba(240,240,240,1)';
                }
            }

            let isZone = false;
            if (pos == 0) {
                isZone = arrSources[i].isZone == 1;
            } else {
                isZone = true;
            }

            arrButtons.push(
                <TouchableOpacity style={{
                    position: 'absolute',

                    flexDirection: 'column',

                    marginLeft: x,
                    marginTop: y,
                    width: LIST_MENU_BUTTON_WIDTH,
                    height: LIST_MENU_BUTTON_WIDTH,

                    overflow: 'hidden',

                    backgroundColor: bgColor,

                    borderRadius: 4,
                }} onPress={this.listMenuButtonAction.bind(this, pos, i, arrSources[i].title, isZone)}
                                  activeOpacity={1}>
                    <Image style={{
                        marginLeft: 12,
                        marginTop: 4,
                        width: 44,
                        height: 44,
                    }} source={arrSources[i].pic}>
                    </Image>

                    <Text style={{
                        marginLeft: 0,
                        marginTop: 5,
                        width: LIST_MENU_BUTTON_WIDTH,
                        height: 15,

                        color: 'rgba(100,100,100,1)',
                        fontSize: 12,
                        fontWeight: 'normal',
                        textAlign: 'center',
                    }}>
                        {arrSources[i].title}
                    </Text>

                </TouchableOpacity>
            );
        }

        return arrButtons;
    }

    // 先于 componentWillReceiveProps 调用
    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {

        switch (nextProps.type) {
            case 0: {
                this.hotsLiveList.setRequestProps(nextProps.params);
                this.vicinityLiveList.setRequestProps(nextProps.params);
                this.goodVoiceLiveList.setRequestProps(nextProps.params);
                this.danceLiveList.setRequestProps(nextProps.params);
                this.funLiveList.setRequestProps(nextProps.params);
                this.chatLiveList.setRequestProps(nextProps.params);
                this.maleLiveList.setRequestProps(nextProps.params);
                this.miniVideoLiveList.setRequestProps(nextProps.params);
                this.mobileLiveList.setRequestProps(nextProps.params);
                this.shopLiveList.setRequestProps(nextProps.params);
            }
                break;

            case 1: {
                this.hotsLiveList.setLoginProps(nextProps.params);
                this.vicinityLiveList.setLoginProps(nextProps.params);
                this.goodVoiceLiveList.setLoginProps(nextProps.params);
                this.danceLiveList.setLoginProps(nextProps.params);
                this.funLiveList.setLoginProps(nextProps.params);
                this.chatLiveList.setLoginProps(nextProps.params);
                this.maleLiveList.setLoginProps(nextProps.params);
                this.miniVideoLiveList.setLoginProps(nextProps.params);
                this.mobileLiveList.setLoginProps(nextProps.params);
                this.shopLiveList.setLoginProps(nextProps.params);
            }
                break;

            default: {
            }
                break;
        }
    }

    mainScrollViewOnScroll(offsetX) {

        let marginLeft = 0;
        let width = 0;

        if (offsetX <= 0) {
            // 左侧过动
            marginLeft = this.headBarMenuButtonOriginXs[0] + HEAD_BAR_MENU_BUTTON_LONGER;
            width = HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[0].length;
        } else if (offsetX >= (SCREEN_WIDTH + UNIVERSAL_PAGE_GAP) * (this.state.zoneTitles.length - 1)) {
            // 右侧过动
            marginLeft = this.headBarMenuButtonOriginXs[this.state.zoneTitles.length - 1] + HEAD_BAR_MENU_BUTTON_LONGER;
            width = HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[this.state.zoneTitles.length - 1].length;
        } else {
            // 中间移动
            let index = offsetX / (SCREEN_WIDTH + UNIVERSAL_PAGE_GAP);
            let leftIndex = Math.floor(index);
            let rightIndex = leftIndex + 1;
            if (leftIndex == index) {
                // 刚好停在整页位置
                marginLeft = this.headBarMenuButtonOriginXs[leftIndex] + HEAD_BAR_MENU_BUTTON_LONGER;
                width = HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[leftIndex].length;
            } else {
                let scale = index - leftIndex;

                let leftOrigin = this.headBarMenuButtonOriginXs[leftIndex] + HEAD_BAR_MENU_BUTTON_LONGER;
                let rightOrigin = this.headBarMenuButtonOriginXs[rightIndex] + HEAD_BAR_MENU_BUTTON_LONGER;

                marginLeft = leftOrigin + (rightOrigin - leftOrigin) * scale;

                if (this.state.zoneTitles[leftIndex].length == this.state.zoneTitles[rightIndex].length) {
                    width = HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[leftIndex].length;
                } else {
                    let leftWidth = HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[leftIndex].length;
                    let rightWidth = HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[rightIndex].length;

                    width = leftWidth + (rightWidth - leftWidth) * scale;
                }
            }
        }

        this.headBarMenuSelectionBar.setNativeProps({
            style: {
                position: 'absolute',

                marginLeft: marginLeft,
                marginTop: 32,
                width: width,
                height: 2,

                backgroundColor: 'rgba(255,255,255,1)',
            }
        });
    }

    mainScrollViewScrollEnd(offsetX) {

        let contentOffsetX = 0;

        let index = Math.floor(offsetX / (SCREEN_WIDTH + UNIVERSAL_PAGE_GAP));

        if (offsetX < 0 || offsetX - Math.floor(offsetX) != 0 || offsetX % (SCREEN_WIDTH + UNIVERSAL_PAGE_GAP) != 0) {
            return;
        }

        let leftWidth = this.headBarMenuButtonOriginXs[index] + HEAD_BAR_MENU_BUTTON_LONGER + HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[index].length / 2;
        let rightWidth = this.headBarMenuContentSizeWidth - leftWidth - HEAD_BAR_MENU_BUTTON_FONT * this.state.zoneTitles[index].length / 2;
        let frameWidth = SCREEN_WIDTH - 46 - 44;

        if (leftWidth <= frameWidth / 2) {
            // 太左了
            contentOffsetX = 0;
        } else if (rightWidth <= frameWidth / 2) {
            // 太右了
            contentOffsetX = this.headBarMenuContentSizeWidth - frameWidth;
        } else {
            // 在中间
            contentOffsetX = leftWidth - frameWidth / 2;
        }

        this.headBarMenuScrollView.scrollTo({x: contentOffsetX, y: 0, animated: true});

        InteractionManager.runAfterInteractions(() => {
            this.setState({
                selectedIndex: index,
            });
        });
    }

    showSearchButtonAction() {
        this.rnCallNativeManager.rnCallNativeWithEvent('showSearch', {});
    }

    menuButtonAction() {

        if (this.isShowingMenu) {
            this.hideListMenu();
        } else {
            this.showListMenu();
        }
    }

    showListMenu() {
        this.isShowingMenu = true;

        // this.listMenuSectionList.scrollToLocation({animated: false, sectionIndex: 0, itemIndex: 0});
        // this.listMenuSectionList.scrollToIndex({animated: false, index: 0, viewPosition: 0});

        Animated.parallel([
            // 右上角按钮三道杠变为X的动画
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(
                        this.state.menuButtonFirstBarOriginY,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: 7,
                        }
                    ),

                    Animated.timing(
                        this.state.menuButtonThirdBarOriginY,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: -7,
                        }
                    ),

                    Animated.timing(
                        this.state.menuButtonSecondBarOpacity,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: 0,
                        }
                    ),
                ]),

                Animated.parallel([
                    Animated.timing(
                        this.state.menuButtonFirstBarRotateZ,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: 45,
                        }
                    ),

                    Animated.timing(
                        this.state.menuButtonThirdBarRotateZ,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: -45,
                        }
                    ),
                ]),
            ]),

            // 下滑菜单渐现动画
            Animated.timing(
                this.state.listMenuContainerHeight,
                {
                    duration: 1,
                    easing: Easing.linear(Easing.ease),
                    toValue: SCREEN_HEIGHT,
                }
            ),

            Animated.timing(
                this.state.listMenuContainerOpacity,
                {
                    duration: 200,
                    easing: Easing.linear(Easing.ease),
                    toValue: 1,
                }
            ),
        ]).start();
    }

    hideListMenu() {
        this.isShowingMenu = false;

        Animated.parallel([
            // 右上角按钮X变回三道杠的动画
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(
                        this.state.menuButtonFirstBarRotateZ,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: 0,
                        }
                    ),

                    Animated.timing(
                        this.state.menuButtonThirdBarRotateZ,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: 0,
                        }
                    ),
                ]),

                Animated.parallel([
                    Animated.timing(
                        this.state.menuButtonFirstBarOriginY,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: 0,
                        }
                    ),

                    Animated.timing(
                        this.state.menuButtonThirdBarOriginY,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: 0,
                        }
                    ),

                    Animated.timing(
                        this.state.menuButtonSecondBarOpacity,
                        {
                            duration: 100,
                            easing: Easing.linear(Easing.ease),
                            toValue: 1,
                        }
                    ),
                ]),
            ]),

            // 下滑菜单渐隐动画
            Animated.timing(
                this.state.listMenuContainerHeight,
                {
                    delay: 199,
                    duration: 1,
                    easing: Easing.linear(Easing.ease),
                    toValue: 0,
                }
            ),

            Animated.timing(
                this.state.listMenuContainerOpacity,
                {
                    duration: 200,
                    easing: Easing.linear(Easing.ease),
                    toValue: 0,
                }
            ),
        ]).start();
    }

    headBarMenuButtonAction(index, title, isZone) {
        console.log('head bar button action ' + index + ' ' + title + ' ' + isZone);
        if (isZone) {
            this.mainScrollView.scrollTo({x: (SCREEN_WIDTH + UNIVERSAL_PAGE_GAP) * index, y: 0, animated: true});
        } else {
            this.rnCallNativeManager.rnCallNativeWithEvent('openH5', {
                title: '六现场',
                url: 'https://m.v.6.cn/xianchang/',
            });
        }
    }

    listMenuButtonAction(pos, index, title, isZone) {
        console.log('list menu button action ' + index + ' ' + title + ' ' + isZone);
        if (pos == 0) {
            if (isZone) {
                this.mainScrollView.scrollTo({x: (SCREEN_WIDTH + UNIVERSAL_PAGE_GAP) * index, y: 0, animated: true});

                this.hideListMenu();
            } else {
                this.rnCallNativeManager.rnCallNativeWithEvent('openH5', {
                    title: '六现场',
                    url: 'https://m.v.6.cn/xianchang/',
                });

                this.hideListMenu();
            }
        } else {
            this.mainScrollView.scrollTo({x: (SCREEN_WIDTH + UNIVERSAL_PAGE_GAP) * 2, y: 0, animated: true});

            this.hideListMenu();

            InteractionManager.runAfterInteractions(() => {
                this.setState({
                    selectedSongIndex: index,
                });
            });
        }
    }

    goodVoiceCallback(index) {
        // to do
        this.setState({
            selectedSongIndex: index,
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',

        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH + UNIVERSAL_PAGE_GAP,
        height: SCREEN_HEIGHT,

        backgroundColor: 'rgba(239,241,242,1)',
    },

    // Scroll View 部分
    hotsPage: {
        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH + UNIVERSAL_PAGE_GAP,
        height: SCREEN_HEIGHT,
    },

    hotsLiveList: {
        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },

    otherPage: {
        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH + UNIVERSAL_PAGE_GAP,
        height: SCREEN_HEIGHT,
    },

    // Head Bar 部分
    headBarContent: {
        flexDirection: 'row',

        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH,
        height: 44,
    },

    headBarMenuContainer: {
        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH - 46 - 44,
        height: 44,
    },

    searchButton: {
        marginLeft: 0,
        marginTop: 0,
        width: 46,
        height: 44,
    },

    searchImage: {
        marginLeft: 8,
        marginTop: 7,
        width: 30,
        height: 30,
    },

    menuButton: {
        marginLeft: 0,
        marginTop: 0,
        width: 44,
        height: 44,
    },

    listMenuBGButton: {
        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,

        backgroundColor: 'rgba(0,0,0,0.2)',
    },
});

// 整体js模块的名称
AppRegistry.registerComponent('xiuchang_iPhone', () => LiveLobbyContainer);
