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

class Vicinity extends React.Component {
    constructor(props) {
        super(props);
        this.nowProvinceTitle = '正在定位...';
        this.anchorDataSource = []; //list的数据
        this.provinceDataSource = [];
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
                this.anchorDataSource = json.content.roomList;
                this.provinceDataSource = json.content.provinceNumAry;
                this.nowProvinceTitle = json.content.ptitle;
                this.setState({
                    nowPid: json.content.pid,
                    loadState: 1,
                });
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error);
                this.setState({
                    loadState: -1,
                });
            })
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
                source={require('./images/LiveLobby/liveLobby_local_menu_cell_selected.png')}
            />);
        } else {
            return (<Image
                source={require('./images/LiveLobby/liveLobby_local_menu_cell_normal.png')}
            />);
        }
    }

    _onSelect(index) {
        console.log('click: ' + this.anchorDataSource[index].username + ' ' + this.anchorDataSource[index].rid);
    }

    _onSelectProvince(index) {
        if (this.state.isCanClick) {//如果动画结束，可以点击
            if (this.state.nowPid != this.provinceDataSource[index].pid) {
                console.log("当前点击的为："+this.provinceDataSource[index].title);
                this.setState({
                    isCanClick: false,
                    nowPid: this.provinceDataSource[index].pid,
                    loadState: 0,
                });
                this.nowProvinceTitle = this.provinceDataSource[index].title;
                this.anchorDataSource = ['1'];
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
                    console.log(this.state.nowPid + '++++' + this.provinceDataSource[index].pid);
                    console.log('=====================================================');
                    console.log("动画结束");
                    this.setState({
                        isShowMenuList: !this.state.isShowMenuList,
                        isCanClick: true,
                    });
                    this.post(this.provinceDataSource[index].pid);//现在点自己也会重发请求
                });
            } else {
                this.closeProvinceMenuuListAnimate();
            }
        }
    }

    renderAnchorCell(item, index) {
        switch (this.state.loadState) {
            //请求失败
            case -1: {//data.length = 1
                return (
                    <View style={styles.failLoadContainer}>
                        <Text style={styles.failLoadContainerText}>请下拉刷新试试</Text>
                    </View>
                );
                break;
            }
            case 0: {
                console.log('qqqq' + item.length);
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
                                <ImageBackground style={styles.cellItemImg}
                                                 source={{uri: item.pospic}}>
                                    <ImageBackground style={styles.cellItemImg}
                                                     source={require('./images/LiveLobby/liveLobby_mask_banner.png')}
                                                     resizeMode='stretch'>
                                    </ImageBackground>
                                </ImageBackground>
                                <View style={styles.cellItemBottomBar}>
                                    <Text style={styles.cellItemBottomBarName}
                                          numberOfLines={1}>{item.username}</Text>
                                    <Image style={styles.cellItemBottomBarIcon}
                                           source={require('./images/LiveLobby/liveLobby_cell_Item_audienceCount.png')}/>
                                    <Text
                                        style={styles.cellItemBottomBarCount}>{item.count}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                );
                break;
            }
        }
    }

    render() {
        return (
            <View>
                <TouchableWithoutFeedback onPress={() => this._onShowProvinceMenu()}>
                    <View style={styles.provinceMenuButton}>
                        <View style={styles.provinceMenuButtonLeftView}>
                            <Image style={styles.provinceMenuButtonLeftViewIcon}
                                   source={require('./images/LiveLobby/liveLobby_local_menu_icon.png')}/>
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
                            source={require('./images/LiveLobby/liveLobby_local_menu_arrow.png')}/>
                    </View>
                </TouchableWithoutFeedback>
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
}

const styles = StyleSheet.create({
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
        marginRight: 10,
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
        backgroundColor: 'rgba(240,240,240,1)',
        height: SCREEN_HEIGHT - 170,
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
        height: (SCREEN_WIDTH - 21) * 0.61,
        flexDirection: 'column',
        marginLeft: 7,
        marginTop: 7,
        borderRadius: 10,
        overflow: 'hidden',
    },
    cellItemImg: {
        width: (SCREEN_WIDTH - 21) / 2,
        height: (SCREEN_WIDTH - 21) / 2,
    },
    cellItemBottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around', //定义了伸缩项目在主轴线的对齐方式
        alignItems: 'center',
        height: 36,
        backgroundColor: 'white',
    },
    cellItemBottomBarName: {
        letterSpacing: 0,
        marginLeft: 8,
        marginBottom: 4,
        width: 90,
        fontSize: 12,
    },
    cellItemBottomBarIcon: {
        width: 12,
        height: 10,
        marginRight: 0,
        marginLeft: 4,
        marginBottom: 4,
    },
    cellItemBottomBarCount: {
        width: 40,
        marginRight: 2,
        marginBottom: 4,
        letterSpacing: 0,
        fontSize: 12,
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

module.exports = Vicinity;