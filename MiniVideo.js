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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const ProvinceMenuMaxHeight = SCREEN_HEIGHT - 170;

class MiniVideo extends React.Component {
    constructor(props) {
        super(props);
        this.anchorDataSource = []; //list的数据
        this.state = {
            nowOptionChose: 0, //0-2 分别对应 推荐 关注 最新
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功
        };
    }

    componentWillMount() {
        this.post('');
    }

    post(pid) {
        console.log("【舞蹈 页面将要打开】");
        // acr: recommend //follow //new
        var act = '&act=recommend';
        var padapi = '&padapi=minivideo-getlist.php';
        var page = '&page=1';
        var pageSize = '&pagesize=200';
        var param = act + padapi + page + pageSize;
        var fetchURL = 'http://dev.v.6.cn/coop/mobile/index.php?padapi=coop/mobile/index.php' + param;
        // var fetchURL = 'https://v.6.cn/coop/mobile/index.php?padapi=coop/mobile/index.php' + param;
        //https://v.6.cn/coop/mobile/index.php?padapi=coop/mobile/index.php&act=recommend&padapi=minivideo-getlist.php&page=1&pagesize=200
        console.log(fetchURL);
        fetch(fetchURL, {})
            .then((response) => response.json())
            .then((json) => {
                console.log("【************* Success *****************】 ");

                console.log(json);

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

    judgePicRULEmpty(str) {
        if (str == null) {
            console.log('-------------------------------------------');
            return (require('./images/LiveLobby/liveLobby_miniVideo_placeholder.png'));
        } else {
            return ({uri: str});
        }
    }
    getMiniVideoSec(sec){
        var time ;
        if (sec>59){
            var minute = parseInt(sec / 60);
            var second = sec % 60;
            var strMinute = minute > 9 ? minute : '0'+minute;
            var strSecond = second > 9 ? second : '0'+second;
            time = strMinute+':'+strSecond;
        }else {
            var strSecond = sec > 9 ? sec : '0'+sec;
            time = '00:'+strSecond;
        }
        console.log(time);
        return(<Text style={styles.cellItemTopTime}>
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
                                                     source={require('./images/LiveLobby/liveLobby_miniVideo_mask.png')}
                                                     resizeMode='stretch'>

                                        <View style={styles.cellItemTop}>
                                            {this.getMiniVideoSec(item.sec)}
                                        </View>
                                        <Image style={styles.cellItemPlayIcon}
                                               source={require('./images/LiveLobby/liveLobby_miniVideo_play_button.png')}
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
                                                       source={require('./images/LiveLobby/liveLobby_miniVideo_play_count.png')}/>
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

    showOptionItem() {
        switch (this.state.nowOptionChose) {
            case 0: {
                return (
                    <View style={styles.optionView}>

                        <View style={styles.optionViewItem}>
                            <Text style={[styles.optionViewTitle, {color: 'red',}]}>推荐</Text>
                        </View>

                        <Text style={styles.optionViewSeparation}></Text>

                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({nowOptionChose: 1,});
                        }}>
                            <View style={styles.optionViewItem}>
                                <Text style={styles.optionViewTitle}>关注</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <Text style={styles.optionViewSeparation}></Text>

                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({
                                nowOptionChose: 2,
                            });
                        }}>
                            <View style={styles.optionViewItem}>
                                <Text style={styles.optionViewTitle}>最新</Text>
                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                );
            }
            case 1: {
                return (
                    <View style={styles.optionView}>
                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({
                                nowOptionChose: 0,
                            });
                        }}>
                            <View style={styles.optionViewItem}>
                                <Text style={styles.optionViewTitle}>推荐</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <Text style={styles.optionViewSeparation}></Text>
                        <View style={styles.optionViewItem}>
                            <Text style={[styles.optionViewTitle, {color: 'red',}]}>关注</Text>
                        </View>
                        <Text style={styles.optionViewSeparation}></Text>

                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({
                                nowOptionChose: 2,
                            });
                        }}>
                            <View style={styles.optionViewItem}>
                                <Text style={styles.optionViewTitle}>最新</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                );
            }
            case 2: {
                return (
                    <View style={styles.optionView}>
                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({
                                nowOptionChose: 0,
                            });
                        }}>
                            <View style={styles.optionViewItem}>
                                <Text style={styles.optionViewTitle}>推荐</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={styles.optionViewSeparation}></Text>
                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({
                                nowOptionChose: 1,
                            });
                        }}>
                            <View style={styles.optionViewItem}>
                                <Text style={styles.optionViewTitle}>关注</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={styles.optionViewSeparation}></Text>

                        <View style={styles.optionViewItem}>
                            <Text style={[styles.optionViewTitle, {color: 'red',}]}>最新</Text>
                        </View>
                    </View>
                );
            }
        }

    }

    render() {
        return (
            <View>
                {this.showOptionItem()}
                <FlatList style={styles.list}
                          data={this.anchorDataSource}
                          numColumns={2}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          renderItem={({item, index}) => this.renderAnchorCell(item, index)
                          }
                          keyExtractor={(item, index) => index}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    optionView: {
        height: 40,
        // backgroundColor:'green',
        flexDirection: 'row',
        justifyContent: 'flex-start', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center',
    },
    optionViewItem: {
        width: (SCREEN_WIDTH - 1) / 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionViewTitle: {
        // marginLeft: (SCREEN_WIDTH - 30 * 3 - 2) / 6,
        width: 30,
        height: 16,
        color: 'rgba(102,102,102,1)',
        fontSize: 13,
    },
    optionViewSeparation: {
        // marginLeft: (SCREEN_WIDTH - 30 * 3 - 1) / 6,
        width: 0.5,
        height: 18,
        backgroundColor: 'rgba(102,102,102,1)',
    },
    list: {
        backgroundColor: 'rgba(240,240,240,1)',
        height: SCREEN_HEIGHT - 155,
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
    cellItemTop:{
        height:17,
        // backgroundColor:'red',
        flexDirection: 'row',
        justifyContent: 'flex-end', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'flex-start',
    },
    cellItemTopTime:{
        marginTop:7,
        marginRight:5,
        fontSize:10,
    },
    cellItemPlayIcon: {
        marginTop: (SCREEN_WIDTH - 21) / 3 - 15 - 17,
        marginLeft: (SCREEN_WIDTH - 21) / 4 - 15,
        width: 30,
        height: 30,
    },
    cellItemBottomRoomBar: {
        marginTop: (SCREEN_WIDTH - 21) / 3 - 15 - 40,
    },
    cellItemBottomRoomBarTitle: {
        letterSpacing: 0,
        width: (SCREEN_WIDTH - 21) * 3 / 8,
        marginLeft: 6,
        fontSize: 12,
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
        // height:14,
        // backgroundColor: 'red',
    },
    cellItemBottomInfoPlayCountView: {
        marginLeft: 5,
        marginBottom: 4,
        flexDirection: 'row',
        justifyContent: 'flex-end', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center',
        width:50,
        // backgroundColor:'red',
    },
    cellItemBottomInfoPlayCountViewIcon: {
        marginLeft:1,
        marginRight: 5,
        width: 14,
        height: 12,
    },
    cellItemBottomInfoPlayCountViewNum: {
        fontSize: 10,
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