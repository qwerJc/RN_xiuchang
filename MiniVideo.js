import React, {} from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableWithoutFeedback,
    TouchableHighlight,
    Dimensions,
    Image,
    ImageBackground,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native'

import PullDownRefreshView from './PullDownRefreshView'
import MiniVideoTypeView   from './MiniVideoTypeView'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const IS_5_8_DEVICE = Dimensions.get('window').height == 812;

class MiniVideo extends React.Component {
    constructor(props) {
        super(props);
        this.anchorDataSource = []; //list的数据
        this.postType = ['recommend','follow','new'];
        this.nowTypeChose = 0;
        this.state = {
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功
        };
    }

    componentWillMount() {
        this.post();
    }


    post() {
        console.log("【舞蹈 页面将要打开】");
        var act = '&act='+this.postType[this.nowTypeChose];
        var padapi = '&padapi=minivideo-getlist.php';
        var page = '&page=1';
        var pageSize = '&pagesize=200';
        var param = act + padapi + page + pageSize;
        // var fetchURL = 'http://dev.v.6.cn/coop/mobile/index.php?padapi=coop/mobile/index.php' + param;
        var fetchURL = 'https://v.6.cn/coop/mobile/index.php?padapi=coop/mobile/index.php' + param;
        //https://v.6.cn/coop/mobile/index.php?padapi=coop/mobile/index.php&act=recommend&padapi=minivideo-getlist.php&page=1&pagesize=200
        console.log(fetchURL);
        fetch(fetchURL, {})
            .then((response) => response.json())
            .then((json) => {
                console.log("【************* Success *****************】 ");

                this.anchorDataSource = json.content.list;
                this.setState({
                    loadState: 1,
                });
            })
            .catch((error) => {
                console.log("【*****1******** False *****************】 ");
                console.log(error);
                this.setState({
                    loadState: -1,
                });
            })
    }

    _onSelect(index) {
        console.log('click: ' + this.anchorDataSource[index].username + ' ' + this.anchorDataSource[index].rid);
    }

    _onSelectType(index) {
        this.nowTypeChose = index;
        // this.autoRefresh();
    }

    judgePicRULEmpty(str) {
        if (str == null) {
            console.log('-------------------------------------------');
            return (require('./images/LiveLobby/mini_video_lobby_video_placeholder.png'));
        } else {
            return ({uri: str});
        }
    }

    getMiniVideoSec(sec) {
        var time;
        if (sec > 59) {
            var minute = parseInt(sec / 60);
            var second = sec % 60;
            var strMinute = minute > 9 ? minute : '0' + minute;
            var strSecond = second > 9 ? second : '0' + second;
            time = strMinute + ':' + strSecond;
        } else {
            var strSecond = sec > 9 ? sec : '0' + sec;
            time = '00:' + strSecond;
        }
        console.log(time);
        return (<Text style={styles.cellItemTopTime}>
            {time}
        </Text>);
    }

    renderAnchorCell(item, index) {
        switch (this.state.loadState) {
            //请求失败
            case -1: {//data.length = 1
                console.log('qqqq' + item.length);
                return (
                    <View style={styles.failLoadContainer}>
                        <Text style={styles.failLoadContainerText}>请下拉刷新试试</Text>
                    </View>
                );
                break;
            }
            case 0: {
                return (
                    <View style={styles.waitLoadContainer}>
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={styles.waitLoadContainerIndicator}
                            size="large"/>
                    </View>
                );
                break;
            }
            case 1: {
                return (
                    <View style={styles.cell}>
                        <TouchableWithoutFeedback onPress={() => this._onSelect(index)}>
                            <View style={styles.cellItem}>
                                <ImageBackground style={styles.cellItemBGImg}
                                                 source={this.judgePicRULEmpty(item.picurl)}>
                                    <ImageBackground style={styles.cellItemBGImg}
                                                     source={require('./images/LiveLobby/mini_video_lobby_mask.png')}
                                                     resizeMode='stretch'>

                                        <View style={styles.cellItemTop}>
                                            {this.getMiniVideoSec(item.sec)}
                                        </View>
                                        <Image style={styles.cellItemPlayIcon}
                                               source={require('./images/LiveLobby/mini_video_lobby_play_button.png')}
                                        />
                                        <View style={styles.cellItemBottomRoomBar}>
                                            <Text style={styles.cellItemBottomRoomBarTitle}
                                                  numberOfLines={1}>{item.title}</Text>
                                        </View>
                                        <View style={styles.cellItemBottomInfo}>
                                            <Image style={styles.cellItemBottomInfoHeadPic}
                                                   source={{uri: item.picuser}}/>
                                            <Text style={styles.cellItemBottomInfoName}>{item.alias}</Text>
                                            <View style={styles.cellItemBottomInfoPlayCountView}>
                                                <Image style={styles.cellItemBottomInfoPlayCountViewIcon}
                                                       source={require('./images/LiveLobby/mini_video_lobby_play_count.png')}/>
                                                <Text style={styles.cellItemBottomInfoPlayCountViewNum}
                                                      numberOfLines={1}>{item.vnum}</Text>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </ImageBackground>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                );
                break;
            }
        }
    }

    renderListHeaderComponent() {
        if (IS_5_8_DEVICE) {
            return (
                <View>
                    <View style={[styles.listHeader, {height: 88}]}></View>
                    <MiniVideoTypeView
                        callbackSelect={(type) => this._onSelectType(type)}/>
                </View>
            );
        } else {
            return (
                <View>
                    <View style={[styles.listHeader, {height: 64}]}></View>
                    <MiniVideoTypeView callbackSelect={(type) => this._onSelectType(type)}/>
                </View>
            );
        }
    }

    renderListFooterComponent() {
        if (IS_5_8_DEVICE) {
            return (
                <View style={[styles.listFooter, {height: 90}]}>
                </View>
            );
        } else {
            return (
                <View style={[styles.listFooter, {height: 56}]}>
                </View>
            );
        }
    }

    render() {
        return (
            <View style={styles.bgVIew}>
                <PullDownRefreshView ref={(c) => this._refPullDownRefreshView = c}
                                     callbackPost={() => this.post()}/>
                <FlatList style={styles.list}
                          data={this.anchorDataSource}
                          numColumns={2}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          renderItem={({item, index}) => this.renderAnchorCell(item, index)}
                          ListHeaderComponent={() => this.renderListHeaderComponent()}
                          ListFooterComponent={() => this.renderListFooterComponent()}
                          keyExtractor={(item, index) => index}
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

    //flatlist 滑动的 delegate
    mainScrollViewOnScroll(offsetY) {
        this._refPullDownRefreshView.judgeScrollState(offsetY, this.isTouchPullDown);
        this.mainListoffsetY = offsetY;

    }

    //触摸结束抬起
    _onReleaseMouse() {
        this.isTouchPullDown = false;

        if (this.mainListoffsetY < -44) {
            this.mainList.scrollToOffset({animated: true, offset: -44});
            this._refPullDownRefreshView.showPullDownView(2);
        }
    }

    //开始触摸屏幕
    _onStartTouch() {
        this.isTouchPullDown = true;
        this._refPullDownRefreshView.showPullDownView(0);
    }
}

const styles = StyleSheet.create({
    bgVIew: {
        backgroundColor: 'rgba(240,240,240,1)',
    },
    listHeader: {
        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH,
    },
    listFooter: {
        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH,
    },
    list: {
        backgroundColor: 'rgba(255,255,255,0)',
        height: SCREEN_HEIGHT,
        paddingBottom: 7,
    },
    cell: {
        marginLeft: 0,
        marginTop: 0,
        paddingBottom: 0,
        //0.61 = 440 / 360; 440:cellHeight ;    360: ItemWidth
        overflow: 'hidden',
    },
    cellItem: {
        width: (SCREEN_WIDTH - 21) / 2,
        height: (SCREEN_WIDTH - 21) * 2 / 3,
        flexDirection: 'column',
        marginLeft: 7,
        marginTop: 7,
        borderRadius: 4,
        overflow: 'hidden',
    },
    cellItemBGImg: {
        width: (SCREEN_WIDTH - 21) / 2,
        height: (SCREEN_WIDTH - 21) * 2 / 3,
        // backgroundColor:'rgba(255,255,255,0.5)',
    },
    cellItemTop: {
        height: 17,
        // backgroundColor:'red',
        flexDirection: 'row',
        justifyContent: 'flex-end', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'flex-start',
    },
    cellItemTopTime: {
        marginTop: 7,
        marginRight: 5,
        fontSize: 10,
        color:'white',
    },
    cellItemPlayIcon: {
        marginTop: (SCREEN_WIDTH - 21) / 3 - 20 - 17,
        marginLeft: (SCREEN_WIDTH - 21) / 4 - 20,
        width: 40,
        height: 40,
    },
    cellItemBottomRoomBar: {
        marginTop: (SCREEN_WIDTH - 21) / 3 - 15 - 40,
    },
    cellItemBottomRoomBarTitle: {
        letterSpacing: 0,
        width: (SCREEN_WIDTH - 21) * 3 / 8,
        marginLeft: 6,
        fontSize: 12,
        color:'white',
    },
    cellItemBottomInfo: {
        flexDirection: 'row',
        justifyContent: 'flex-start', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center',
        // backgroundColor: 'green',
        height: 25,
    },
    cellItemBottomInfoHeadPic: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginLeft: 5,
    },
    cellItemBottomInfoName: {
        fontSize: 11,
        marginLeft: 5,
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
        width: (SCREEN_WIDTH - 21) / 2 - 90,
        color:'white',
    },
    cellItemBottomInfoPlayCountView: {
        marginLeft: 5,
        marginBottom: 4,
        flexDirection: 'row',
        justifyContent: 'flex-end', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center',
        width: 50,
        // backgroundColor:'red',
    },
    cellItemBottomInfoPlayCountViewIcon: {
        marginLeft: 1,
        marginRight: 5,
        width: 14,
        height: 12,
    },
    cellItemBottomInfoPlayCountViewNum: {
        fontSize: 10,
        color:'white',
    },
    //WaitLoading
    waitLoadContainer: {
        height: SCREEN_HEIGHT - 170,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(240,240,240,1)',
    },
    waitLoadContainerIndicator: {
        height: 80,
    },
    //FailLoading
    failLoadContainer: {
        height: SCREEN_HEIGHT - 170,
        width: SCREEN_WIDTH,
        // paddingTop:200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(240,240,240,1)',
    },
    failLoadContainerText: {
        color: 'gray',
    }
});

module.exports = MiniVideo;