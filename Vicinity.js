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
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native'

import AnchorPostDisplay from './AnchorPostDisplay'
import FailPostDisplay from './FailPostDisplay'
import LoadPostDisplay from './LoadPostDisplay'
import EmptyPostDisplay from './EmptyPostDisplay'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const ProvinceMenuMaxHeight = SCREEN_HEIGHT - 170;

class Vicinity extends React.Component {
    constructor(props) {
        super(props);
        this.nowProvinceTitle = '正在定位...';
        this.anchorDataSource = ['null']; //list的数据
        this.provinceDataSource = [''];
        //下面为下拉刷新相关属性
        this.mainListoffsetY = 0;
        this.timeDate = 0;
        this.isTouchPullDown = true; //判断当前是否处于用户拖动状态

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
        this.post('');
    }

    post(pid) {
        this.timeDate = (new Date()).valueOf();     //更新时间戳

        var formdata = new FormData();
        formdata.append("size", '0');
        formdata.append("p", '0');
        formdata.append("pid", pid);

        console.log("【舞蹈 页面将要打开】");
        fetch('http://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getlivelistlocation.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formdata,
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
                this.showPullDownView(3);
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
                this.showPullDownView(3);
                this.mainList.scrollToOffset({animated: true, offset: 0});
            })
    }

    autoRefresh() {
        let nowTime = (new Date()).valueOf();
        let diff = nowTime - this.timeDate;

        if (diff > 180000) {
            console.log(this.timeDate);
            // this.isTouchPullDown = true;
            this.mainList.scrollToOffset({animated: true, offset: -44});
            this.showPullDownView(2);
            this.timer = setTimeout(
                () => {
                    this.post(this.state.nowPid);
                },
                300
            );
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

    returnAnchorItem(item, index) {
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
                    <View style={styles.cellItem}>
                        <View style={styles.anchorGap}>
                        </View>
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

    renderProvinceMenu() {
        return (
            <TouchableWithoutFeedback onPress={() => this._onShowProvinceMenu()}>
                <View style={styles.provinceMenuButton}>
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
            </TouchableWithoutFeedback>
        );
    }

    render() {
        return (
            <View style={styles.bgVIew}>
                <View style={styles.pullDownRefreshBG}>
                    <View ref={(c) => this._refPullDownViewPull = c}
                          style={[styles.pullDownRefreshView, {display: 'flex'}]}>
                        <Image source={require('./images/LiveLobby/refresh_arrow.png')}
                               style={{transform: [{rotate: '0deg'}]}}
                               ref={(imgArrow) => this.imgArrowState = imgArrow}/>
                        <Text style={styles.pullDownRefreshViewTitle}>下拉刷新</Text>
                    </View>
                    <View ref={(c) => this._refPullDownViewRelease = c}
                          style={styles.pullDownRefreshView}>
                        <Image source={require('./images/LiveLobby/refresh_arrow.png')}
                               style={{transform: [{rotate: '180deg'}]}}/>
                        <Text style={styles.pullDownRefreshViewTitle}>释放更新</Text>
                    </View>
                    <View ref={(c) => this._refPullDownViewLoading = c}
                          style={styles.pullDownRefreshView}>
                        <ActivityIndicator
                            style={{marginRight: 7}}
                            animating={this.state.animating}
                            size="small"/>
                        <Text style={styles.pullDownRefreshViewTitle}>加载中...</Text>
                    </View>
                    <View ref={(c) => this._refPullDownViewFinish = c}
                          style={styles.pullDownRefreshView}>
                        <Text style={styles.pullDownRefreshViewTitle}>加载完成</Text>
                    </View>
                </View>

                <FlatList style={styles.list}
                          data={this.anchorDataSource}
                          numColumns={2}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          renderItem={({item, index}) => this.returnAnchorItem(item, index)}
                          ListHeaderComponent={this.renderProvinceMenu.bind(this)}
                          keyExtractor={(item, index) => index}
                          scrollEventThrottle={30}
                          onScroll={(event) => this.mainScrollViewOnScroll(event.nativeEvent.contentOffset.y)}
                          ref={(refMainList) => {
                              this.mainList = refMainList;
                          }}
                          onResponderGrant={() => this._onStartTouch()}
                          onResponderRelease={() => this._onReleaseMouse()}
                />
                <Animated.View style={{
                    overflow: 'hidden',
                    marginTop: 55,
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
            </View>
        );
    }

    //flatlist 滑动的 delegate
    mainScrollViewOnScroll(offsetY) {
        if (this.isTouchPullDown) { //下面的动画效果只应存在于拖动时，若不加判断会导致回弹动画时逆序触发下面动效
            this.mainListoffsetY = offsetY;
            if (offsetY >= 0) {
                this.imgArrowState.setNativeProps({
                    style: {transform: [{rotate: '0deg'}]}
                });
                //翻转图片
            } else if (-44 < offsetY && offsetY < 0) {
                this.showPullDownView(0);
                let rotateRate = offsetY / 44;
                // console.log(rotateRate);
                let rotateValue = parseInt(rotateRate * 180) + 'deg';
                this.imgArrowState.setNativeProps({
                    style: {transform: [{rotate: rotateValue}]}
                });
                // console.log('仅执行动画，不进行下拉刷新');
            } else {
                this.showPullDownView(1);
            }
        }
    }

    //根据下拉状态显示不同的 下拉刷新view（其余隐藏）
    showPullDownView(index) {
        switch (index) {
            //下拉过程中
            case 0: {
                this._refPullDownViewPull.setNativeProps({
                    style: {display: 'flex'}
                });
                this._refPullDownViewRelease.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewLoading.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewFinish.setNativeProps({
                    style: {display: 'none'}
                });
                break;
            }
            //超过临界值，释放可更新
            case 1: {
                this._refPullDownViewPull.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewRelease.setNativeProps({
                    style: {display: 'flex'}
                });
                this._refPullDownViewLoading.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewFinish.setNativeProps({
                    style: {display: 'none'}
                });
                break;
            }
            //已松手，加载中
            case 2: {
                this._refPullDownViewPull.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewRelease.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewLoading.setNativeProps({
                    style: {display: 'flex'}
                });
                this._refPullDownViewFinish.setNativeProps({
                    style: {display: 'none'}
                });
                break;
            }
            //加载完成
            case 3: {
                this._refPullDownViewPull.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewRelease.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewLoading.setNativeProps({
                    style: {display: 'none'}
                });
                this._refPullDownViewFinish.setNativeProps({
                    style: {display: 'flex'}
                });
                break;
            }
        }
    }

    //触摸结束抬起
    _onReleaseMouse() {
        this.isTouchPullDown = false;

        if (this.mainListoffsetY < -44) {

            this.mainList.scrollToOffset({animated: true, offset: -44});

            this.showPullDownView(2);

            this.timer = setTimeout(
                () => {
                    this.post(this.state.nowPid);
                },
                10
            );
        }
    }

    //开始触摸屏幕
    _onStartTouch() {
        this.isTouchPullDown = true;
        this.showPullDownView(0);
    }
}

const styles = StyleSheet.create({
    //下拉刷新
    bgVIew: {
        backgroundColor: 'rgba(240,240,240,1)',
    },
    pullDownRefreshBG: {
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
        height: SCREEN_HEIGHT - 115,
        paddingBottom: 7,
    },
    cellItem: {
        flexDirection: 'row',
    },
    anchorGap: {
        marginTop: 7,
        backgroundColor: 'rgba(240,240,240,1)',
        width: 7,
        height: (SCREEN_WIDTH - 7 * 3) / 2 + 36,
    },
});

module.exports = Vicinity;