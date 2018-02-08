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
                if (json.content.roomList.length > 0) {
                    //请求成功 且 返回数据不为空 替换当前数据
                    this.anchorDataSource = json.content.roomList;
                    this.setState({
                        nowPid: json.content.pid,
                        loadState: 1,
                    });
                }else {
                    //请求成功 但 返回数据为空 替换当前数据
                    this.anchorDataSource = ['null'];
                    this.setState({
                        nowPid: json.content.pid,
                        loadState: 2,
                    });
                }
                this.provinceDataSource = json.content.provinceNumAry;
                this.nowProvinceTitle = json.content.ptitle;
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error);
                //请求失败 不加载旧数据 直接渲染'请求错误'页面
                this.anchorDataSource = ['null'];
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
                source={require('./images/LiveLobby2/liveLobby_local_menu_cell_selected.png')}
            />);
        } else {
            return (<Image
                source={require('./images/LiveLobby2/liveLobby_local_menu_cell_normal.png')}
            />);
        }
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
                return (<AnchorPostDisplay dataDic={item} tagsDic={this.state.tagInfo}/>);
                break;
            }
            case 2: {
                return (<EmptyPostDisplay layoutType={0}/>);
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
                <FlatList style={styles.list}
                          data={this.anchorDataSource}
                          numColumns={2}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          renderItem={({item, index}) => this.returnAnchorItem(item, index)
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
});

module.exports = Vicinity;