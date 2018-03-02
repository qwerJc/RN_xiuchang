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
    Animated,
    Easing,
} from 'react-native'

import PullDownRefreshView from './PullDownRefreshView'

import AnchorPostDisplay from './AnchorPostDisplay'
import FailPostDisplay from './FailPostDisplay'
import LoadPostDisplay from './LoadPostDisplay'
import EmptyPostDisplay from './EmptyPostDisplay'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const IS_5_8_DEVICE = Dimensions.get('window').height == 812;

const ProvinceMenuMaxHeight = IS_5_8_DEVICE ? SCREEN_HEIGHT - 170 : SCREEN_HEIGHT - 226;

class Vicinity extends React.Component {
    static defaultProps = {
        av : '',
        refreshInterval : 180000,
    }
    constructor(props) {
        super(props);
        this.rate = '1';
        this.uid = '';
        this.encpass = '';
        this.rand='';

        this.nowProvinceTitle = '正在定位...';
        this.anchorDataSource = ['null']; //list的数据
        this.provinceDataSource = [''];
        //下面为下拉刷新相关属性
        this.mainListoffsetY = 0;
        this.timeDate = 0;
        this.isTouchPullDown = false; //判断当前是否处于用户拖动状态

        this.state = {
            nowPid: 0,
            provinceMenuListHeight: new Animated.Value(0),
            isCanClick: true,
            isShowMenuList: false,
            iconRotateValue: new Animated.Value(0.5),
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功
        };
    }

    componentWillMount() {
        // this.post('');
    }

    setRequestProps(props){
        this.rate = props.rate;
        this.uid = props.uid;
        this.encpass = props.encpass;
        this.rand = props.rand;
    }
    setLoginProps(props) {
        this.uid = props.uid;
        this.encpass = props.encpass;
    }

    post(pid) {
        this.timeDate = (new Date()).valueOf();     //更新时间戳

        var requestParams = new FormData();
        requestParams.append("size", '0');
        requestParams.append("p", '0');
        requestParams.append("pid", pid);
        requestParams.append('logiuid', this.uid);
        requestParams.append('encpass', this.encpass);
        if (this.rate){
            requestParams.append('rand', this.rand);
        }

        console.log("【舞蹈 页面将要打开】");
        fetch('http://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getlivelistlocation.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestParams,
        })
            .then((response) => response.json())
            .then((json) => {
                console.log("【************* Success *****************】 ");
                this.provinceDataSource = json.content.provinceNumAry;
                this.nowProvinceTitle = json.content.ptitle;
                if (json.content.roomList.length > 0) {
                    //请求成功 且 返回数据不为空 替换当前数据
                    this.anchorDataSource = json.content.roomList;
                    this.setState({
                        nowPid: json.content.pid,
                        loadState: 1,
                    });
                } else {
                    //请求成功 但 返回数据为空 替换当前数据
                    this.anchorDataSource = ['null'];
                    this.setState({
                        nowPid: json.content.pid,
                        loadState: 2,
                    });
                }
                this._refPullDownRefreshView.showPullDownView(3);
                this.mainList.scrollToOffset({animated: true, offset: 0});
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error);
                //请求失败 不加载旧数据 直接渲染'请求错误'页面
                this.anchorDataSource = ['null'];
                this.setState({
                    loadState: -1,
                });
                this._refPullDownRefreshView.showPullDownView(3);
                this.mainList.scrollToOffset({animated: true, offset: 0});
            })
    }

    autoRefresh() {
        let nowTime = (new Date()).valueOf();
        let diff = nowTime - this.timeDate;

        if (this.timeDate == 0){
            this.post('');
        }else {
            if (diff > this.props.refreshInterval) {

                this.mainList.scrollToOffset({animated: true, offset: -44});
                this._refPullDownRefreshView.showPullDownView(2);
            }
        }
    }

    _onShowProvinceMenu() {
        //判断当前是否可以点击，防止
        if (this.state.isCanClick) {
            this.setState({
                isCanClick: false,
            });
            if (this.state.isShowMenuList) {//close
                this.closeProvinceMenuuListAnimate();
            } else {
                this.showProvinceMenuListAnimate();
            }
        }
    }

    //展示省份选择列表
    showProvinceMenuListAnimate() {
        // this.provinceMenuListHeight = ProvinceMenuMaxHeight;
        Animated.timing(
            this.state.iconRotateValue, {
                toValue: 1,
                duration: 500,
                // easing: Easing.bezier(0.0, 0.73, 0.37, 1),
                easing: Easing.inOut(Easing.quad),
            }).start(() => this.animateProvinceMeunEnd());

        // this.state.provinceMenuListHeight.setValue(0);
        Animated.timing(
            this.state.provinceMenuListHeight,
            {
                duration: 500,
                toValue: ProvinceMenuMaxHeight,
                easing: Easing.inOut(Easing.quad),
            }
        ).start();
    }

    //关闭省份选择列表
    closeProvinceMenuuListAnimate() {
        this.state.iconRotateValue.setValue(0);
        Animated.timing(
            this.state.iconRotateValue, {
                toValue: 0.5,
                duration: 500,// 动画持续的时间（单位是毫秒）
                easing: Easing.inOut(Easing.quad),
            }).start(() => this.animateProvinceMeunEnd());

        //list animation
        // this.state.provinceMenuListHeight.setValue(ProvinceMenuMaxHeight);
        Animated.timing(
            this.state.provinceMenuListHeight,
            {
                duration: 500,
                toValue: 0,
                easing: Easing.inOut(Easing.quad),
            }
        ).start();
    }

    animateProvinceMeunEnd() {
        this.setState({
            isShowMenuList: !this.state.isShowMenuList,
            isCanClick: true,
        });
    }

    //判断省份列表选择状态
    judgeProvinceMenuSelect(index) {
        if (this.state.nowPid == this.provinceDataSource[index].pid) {
            return (<Image
                source={require('./images/LiveLobby/live_list_icon_menu_cell_selected.png')}
            />);
        } else {
            return (<Image
                source={require('./images/LiveLobby/live_list_icon_menu_cell_normal.png')}
            />);
        }
    }

    _onSelectProvince(index) {
        if (this.state.isCanClick) {//如果动画结束，可以点击
            console.log("当前点击的为：" + this.provinceDataSource[index].title);
            this.setState({
                isCanClick: false,
                nowPid: this.provinceDataSource[index].pid,
                loadState: 0,
            });
            this.nowProvinceTitle = this.provinceDataSource[index].title;
            this.anchorDataSource = ['loading'];
            this.state.iconRotateValue.setValue(0);
            Animated.timing(
                this.state.iconRotateValue, {
                    toValue: 0.5,
                    duration: 500,// 动画持续的时间（单位是毫秒）
                    easing: Easing.inOut(Easing.quad),
                }).start();
            Animated.timing(
                this.state.provinceMenuListHeight,
                {
                    duration: 500,
                    toValue: 0,
                    easing: Easing.inOut(Easing.quad),
                }
            ).start(() => {
                console.log("动画结束");
                this.setState({
                    isShowMenuList: !this.state.isShowMenuList,
                    isCanClick: true,
                });
                this.post(this.provinceDataSource[index].pid);//现在点自己也会重发请求
            });
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

    renderAnchorItem(item, index) {
        switch (this.state.loadState) {
            //请求失败
            case -1: {//data.length = 1
                return (<FailPostDisplay layoutType={0}/>);
                break;
            }
            case 0: {
                return (<LoadPostDisplay layoutType={0}/>);
                break;
            }
            case 1: {
                return (
                    <View>
                        <View style={styles.anchorGap}></View>
                        <AnchorPostDisplay dataDic={item} tagsDic={this.tagInfo}/>
                    </View>
                );
                break;
            }
            case 2: {
                return (<EmptyPostDisplay layoutType={0}/>);
                break;
            }
        }
    }

    renderListHeaderComponent1() {
        if (IS_5_8_DEVICE) {
            return (
                <View style={{height: 143}}>
                    <View style={[styles.listHeader, {height: 88}]}></View>
                    <View ref={(c) => this._refProvinceMenuUnclick = c}
                          style={styles.provinceMenuButton}>
                        <View style={styles.provinceMenuButtonLeftView}>
                            <Image style={styles.provinceMenuButtonLeftViewIcon}
                                   source={require('./images/LiveLobby/live_list_icon_local.png')}/>
                            <Text style={styles.provinceMenuButtonLeftViewTitle}>
                                {this.nowProvinceTitle}
                            </Text>
                        </View>
                        <Image // 可选的基本组件类型: Image, Text, View(可以包裹任意子View)
                            style={[styles.provinceMenuButtonArrow, {
                                transform: [{rotate: '180deg'}]
                            }]}
                            source={require('./images/LiveLobby/live_list_icon_local_menu_arrow.png')}/>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={{height: 119}}>
                    <View style={[styles.listHeader, {height: 64}]}></View>
                    <View ref={(c) => this._refProvinceMenuUnclick = c}
                          style={styles.provinceMenuButton}>
                        <View style={styles.provinceMenuButtonLeftView}>
                            <Image style={styles.provinceMenuButtonLeftViewIcon}
                                   source={require('./images/LiveLobby/live_list_icon_local.png')}/>
                            <Text style={styles.provinceMenuButtonLeftViewTitle}>
                                {this.nowProvinceTitle}
                            </Text>
                        </View>
                        <Image // 可选的基本组件类型: Image, Text, View(可以包裹任意子View)
                            style={[styles.provinceMenuButtonArrow, {
                                transform: [{rotate: '180deg'}]
                            }]}
                            source={require('./images/LiveLobby/live_list_icon_local_menu_arrow.png')}/>
                    </View>
                </View>
            );
        }
    }

    renderProvinceMenu() {
        if (IS_5_8_DEVICE) {
            return (
                <TouchableWithoutFeedback onPress={() => this._onShowProvinceMenu()}>
                    <View style={{height: 55, position: 'absolute', marginTop: 88}}>
                        <View ref={(c) => this._refProvinceMenuClick = c}
                              style={styles.provinceMenuButton}>
                            <View style={styles.provinceMenuButtonLeftView}>
                                <Image style={styles.provinceMenuButtonLeftViewIcon}
                                       source={require('./images/LiveLobby/live_list_icon_local.png')}/>
                                <Text style={styles.provinceMenuButtonLeftViewTitle}>
                                    {this.nowProvinceTitle}
                                </Text>
                            </View>
                            <Animated.Image // 可选的基本组件类型: Image, Text, View(可以包裹任意子View)
                                style={[styles.provinceMenuButtonArrow, {
                                    transform: [{
                                        rotate: this.state.iconRotateValue.interpolate({ // 旋转，使用插值函数做值映射
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }]
                                }]}
                                source={require('./images/LiveLobby/live_list_icon_local_menu_arrow.png')}/>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            );
        } else {
            return (
                <TouchableWithoutFeedback onPress={() => this._onShowProvinceMenu()}>
                    <View style={{height: 55, position: 'absolute', marginTop: 64}}>
                        <View ref={(c) => this._refProvinceMenuClick = c}
                              style={styles.provinceMenuButton}>
                            <View style={styles.provinceMenuButtonLeftView}>
                                <Image style={styles.provinceMenuButtonLeftViewIcon}
                                       source={require('./images/LiveLobby/live_list_icon_local.png')}/>
                                <Text style={styles.provinceMenuButtonLeftViewTitle}>
                                    {this.nowProvinceTitle}
                                </Text>
                            </View>
                            <Animated.Image // 可选的基本组件类型: Image, Text, View(可以包裹任意子View)
                                style={[styles.provinceMenuButtonArrow, {
                                    transform: [{
                                        rotate: this.state.iconRotateValue.interpolate({ // 旋转，使用插值函数做值映射
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }]
                                }]}
                                source={require('./images/LiveLobby/live_list_icon_local_menu_arrow.png')}/>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            );
        }
    }

    renderProvinceMenuList() {
        if (IS_5_8_DEVICE) {
            return (
                <Animated.View style={{
                    overflow: 'hidden',
                    marginTop: 143,
                    position: 'absolute',
                    height: this.state.provinceMenuListHeight,
                    width: SCREEN_WIDTH,
                    backgroundColor: 'green',
                }}>
                    <FlatList style={styles.provinceMenuList}
                              data={this.provinceDataSource}
                              renderItem={({item, index}) =>
                                  <TouchableHighlight underlayColor='rgba(240,240,240,1)'
                                                      onPress={() => this._onSelectProvince(index)}>
                                      <View>
                                          <View style={styles.provinceMenuListCell}>
                                              <Text>
                                                  {item.title}
                                              </Text>
                                              {this.judgeProvinceMenuSelect(index)}
                                          </View>
                                          <View style={styles.provinceMenuListSeparator}></View>
                                      </View>
                                  </TouchableHighlight>
                              }
                              keyExtractor={(item, index) => index}
                    />
                </Animated.View>
            );
        } else {
            return (
                <Animated.View style={{
                    overflow: 'hidden',
                    marginTop: 119,
                    position: 'absolute',
                    height: this.state.provinceMenuListHeight,
                    width: SCREEN_WIDTH,
                    backgroundColor: 'green',
                }}>
                    <FlatList style={styles.provinceMenuList}
                              data={this.provinceDataSource}
                              renderItem={({item, index}) =>
                                  <TouchableHighlight underlayColor='rgba(240,240,240,1)'
                                                      onPress={() => this._onSelectProvince(index)}>
                                      <View>
                                          <View style={styles.provinceMenuListCell}>
                                              <Text>
                                                  {item.title}
                                              </Text>
                                              {this.judgeProvinceMenuSelect(index)}
                                          </View>
                                          <View style={styles.provinceMenuListSeparator}></View>
                                      </View>
                                  </TouchableHighlight>
                              }
                              keyExtractor={(item, index) => index}
                    />
                </Animated.View>
            );
        }
    }

    render() {
        return (
            <View style={styles.bgVIew}>
                <PullDownRefreshView ref={(c) => this._refPullDownRefreshView = c}
                                     callbackPost={() => this.post(this.state.nowPid)}/>

                <FlatList style={styles.list}
                          data={this.anchorDataSource}
                          numColumns={2}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          renderItem={({item, index}) => this.renderAnchorItem(item, index)}
                          ListHeaderComponent={this.renderListHeaderComponent1.bind(this)}
                          ListFooterComponent={() => this.renderListFooterComponent()}
                          keyExtractor={(item, index) => index}
                          scrollEventThrottle={30}
                          onScroll={(event) => this.mainScrollViewOnScroll(event.nativeEvent.contentOffset.y)}
                          ref={(refMainList) => {
                              this.mainList = refMainList;
                          }}
                          onResponderGrant={() => this._onStartTouch()}
                          onResponderRelease={() => this._onReleaseMouse()}
                />

                {this.renderProvinceMenu()}
                {this.renderProvinceMenuList()}
            </View>
        );
    }

    //flatlist 滑动的 delegate
    mainScrollViewOnScroll(offsetY) {
        this._refPullDownRefreshView.judgeScrollState(offsetY, this.isTouchPullDown);
        this.mainListoffsetY = offsetY;
        if (offsetY >= 0) {
            this._refProvinceMenuUnclick.setNativeProps({
                style: {display: 'none'}
            });
            this._refProvinceMenuClick.setNativeProps({
                style: {display: 'flex'}
            });
        } else {
            this._refProvinceMenuUnclick.setNativeProps({
                style: {display: 'flex'}
            });
            this._refProvinceMenuClick.setNativeProps({
                style: {display: 'none'}
            });
        }
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
    //下拉刷新
    pullDownRefreshBG: {
        // marginTop: 64,
        height: 44,
        width: SCREEN_WIDTH,
        // backgroundColor: 'gray',
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pullDownRefreshView: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'none',
    },
    pullDownRefreshViewTitle: {
        // marginLeft:7,
        color: 'rgba(146, 146, 146, 1)',
    },
    //省份菜单
    provinceMenuButton: {
        height: 55,
        width: SCREEN_WIDTH,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center',
    },
    provinceMenuButtonLeftView: {
        flexDirection: 'row',
        justifyContent: 'flex-start', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center'
    },
    provinceMenuButtonLeftViewIcon: {
        marginLeft: 10,
        width: 13,
        height: 17,
    },
    provinceMenuButtonLeftViewTitle: {
        color: 'red',
        paddingLeft: 10,
    },
    provinceMenuButtonArrow: {
        marginRight: 15,
        width: 20,
        height: 17,
    },
    provinceMenuList: {
        backgroundColor: 'white',
    },
    provinceMenuListCell: {
        height: 55,
        flexDirection: 'row',
        justifyContent: 'space-between', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
    },
    provinceMenuListSeparator: {
        height: 1,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: 'rgba(240,240,240,1)',
    },
    list: {
        backgroundColor: 'rgba(255,255,255,0)',
        height: SCREEN_HEIGHT,
        paddingBottom: 7,
    },
    cellItem: {
        flexDirection: 'row',
    },
    anchorGap: {
        backgroundColor: 'rgba(240,240,240,1)',
        width: (SCREEN_WIDTH - 7 ) / 2,
        height: 7,
    },
    listHeader: {
        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
    },
    listFooter: {
        marginLeft:0,
        marginTop:0,
        width:SCREEN_WIDTH,
    },
});

module.exports = Vicinity;