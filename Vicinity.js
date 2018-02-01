import React, {} from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableWithoutFeedback,
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
        this.provinceMenuButtonTitle = '正在定位...';
        this.state = {
            provinceMenuListHeight: new Animated.Value(0),
            isCanClick: true,
            isShowMenuList: false,
            iconRotateValue: new Animated.Value(0.5),
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功
            dataSource: [], //list的数据
            tagInfo: [],    //所有tag标签的数据
        };
    }

    componentWillMount() {
        this.post();
    }

    post() {
        var formdata = new FormData();
        formdata.append("rate", '1')
        formdata.append("type", 'u1')
        formdata.append("size", '0')
        formdata.append("p", '0')
        formdata.append("av", '2.7')

        console.log("【舞蹈 页面将要打开】");
        fetch('http://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getlivelistnew.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formdata,
        })
            .then((response) => response.json())
            .then((json) => {
                console.log("【************* Success *****************】 ");
                this.setState({
                    dataSource: json.content.u1,
                    tagInfo: json.content.tagInfo,
                    loadState: 1,
                });
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error)
                this.setState({
                    loadState: -1,
                });
            })
    }

    _onSelect(index) {
        console.log('click: ' + this.state.dataSource[index].username + ' ' + this.state.dataSource[index].rid);
    }

    //tagIDs 为 每个cellItem的tagID的集合
    showTag(tagIDs) {
        if (tagIDs.length > 0) {
            //根据当前Item所需要渲染的Tag数目进行选择加载，当前最多支持4个Tag
            switch (tagIDs.length) {
                case 1: {
                    return (
                        <View style={styles.cellItemImgTagBar}>
                            {this.getTagView(tagIDs[0], true)}
                        </View>
                    );
                    break;
                }
                case 2: {
                    return (
                        <View style={styles.cellItemImgTagBar}>
                            {this.getTagView(tagIDs[0], true)}
                            {this.getTagView(tagIDs[1], false)}
                        </View>
                    );
                    break;
                }
                case 3: {
                    return (
                        <View style={styles.cellItemImgTagBar}>
                            {this.getTagView(tagIDs[0], true)}
                            {this.getTagView(tagIDs[1], false)}
                            {this.getTagView(tagIDs[2], false)}
                        </View>
                    );
                    break;
                }
                case 4: {
                    return (
                        <View style={styles.cellItemImgTagBar}>
                            {this.getTagView(tagIDs[0], true)}
                            {this.getTagView(tagIDs[1], false)}
                            {this.getTagView(tagIDs[2], false)}
                            {this.getTagView(tagIDs[4], false)}
                        </View>
                    );
                    break;
                }
            }
        }
    }

    //获取每个Tag标签的View，因为第一个标签和其余标签样式不同，所以根据 isFirstTag 来判断加载哪种样式
    getTagView(tagID, isFirstTag) {
        var index = 0;
        while (index < this.state.tagInfo.length) {
            if (tagID == this.state.tagInfo[index].id) {
                if (isFirstTag) {
                    return (<Image
                        style={{
                            width: this.state.tagInfo[index].viewPicSmall.img2xw / 2,
                            height: this.state.tagInfo[index].viewPicSmall.img2xh / 2,
                            marginLeft: 8,
                            marginBottom: 5,
                        }}
                        source={{uri: this.state.tagInfo[index].viewPicSmall.img2x}}/>);
                } else {
                    return (<Image
                        style={{
                            width: this.state.tagInfo[index].viewPicSmall.img2xw / 2,
                            height: this.state.tagInfo[index].viewPicSmall.img2xh / 2,
                            marginLeft: 5,
                            marginBottom: 5,
                        }}
                        source={{uri: this.state.tagInfo[index].viewPicSmall.img2x}}/>);
                }
            }
            index++;
        }
    }

    _onShowProvinceMenu() {
        //判断当前是否可以点击，防止
        if (this.state.isCanClick) {
            this.setState({
                isCanClick: false,
            });
            if (this.state.isShowMenuList) {//close
                this.state.iconRotateValue.setValue(0);
                Animated.timing(
                    this.state.iconRotateValue, {
                        toValue: 0.5,
                        duration: 500,// 动画持续的时间（单位是毫秒）
                        easing: Easing.inOut(Easing.quad),
                    }).start(() => this.animateProvinceMeunEnd());

                //list animation
                this.state.provinceMenuListHeight.setValue(ProvinceMenuMaxHeight);
                Animated.timing(
                    this.state.provinceMenuListHeight,
                    {
                        duration: 500,
                        toValue: 0,
                        easing: Easing.inOut(Easing.quad),
                    }
                ).start();
            } else {
                // this.provinceMenuListHeight = ProvinceMenuMaxHeight;
                Animated.timing(
                    this.state.iconRotateValue, {
                        toValue: 1,
                        duration: 500,
                        // easing: Easing.bezier(0.0, 0.73, 0.37, 1),
                        easing: Easing.inOut(Easing.quad),
                    }).start(() => this.animateProvinceMeunEnd());

                this.state.provinceMenuListHeight.setValue(0);
                Animated.timing(
                    this.state.provinceMenuListHeight,
                    {
                        duration: 500,
                        toValue: ProvinceMenuMaxHeight,
                        easing: Easing.inOut(Easing.quad),
                    }
                ).start();
            }
        }
    }

    animateProvinceMeunEnd() {
        this.setState({
            isShowMenuList: !this.state.isShowMenuList,
            isCanClick: true,
        });
        console.log("End : ");
    }

    render() {
        switch (this.state.loadState) {
            //请求失败
            case -1: {
                return (
                    <View style={styles.failLoadContainer}>
                        <Text style={styles.failLoadContainerText}>请下拉刷新试试</Text>
                    </View>
                );
                break;
            }//加载中
            case  0: {
                return (
                    <View style={styles.waitLoadContainer}>
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={styles.waitLoadContainerIndicator}
                            size="large"/>
                    </View>
                );
                break;
            }//请求成功
            case 1: {
                //数据不为空 center,contain,cover,repeat,stretch
                if (this.state.dataSource.length > 0) {
                    return (
                        <View>
                            <TouchableWithoutFeedback onPress={() => this._onShowProvinceMenu()}>
                                <View style={styles.provinceMenuButton}>
                                    <View style={styles.provinceMenuButtonLeftView}>
                                        <Image style={styles.provinceMenuButtonLeftViewIcon}
                                               source={require('./images/LiveLobby/liveLobby_local_menu_icon.png')}/>
                                        <Text style={styles.provinceMenuButtonLeftViewTitle}>
                                            {this.provinceMenuButtonTitle}
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
                                      data={this.state.dataSource}
                                      numColumns={2}
                                      getItemLayout={(data, index) => ({
                                          length: (SCREEN_WIDTH - 24) * 0.61,
                                          offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                                          index
                                      })}
                                      renderItem={({item, index}) =>
                                          <View style={styles.cell}>
                                              <TouchableWithoutFeedback onPress={() => this._onSelect(index)}>
                                                  <View style={styles.cellItem}>
                                                      <ImageBackground style={styles.cellItemImg}
                                                                       source={{uri: item.pospic}}>
                                                          <ImageBackground style={styles.cellItemImg}
                                                                           source={require('./images/LiveLobby/liveLobby_mask_banner.png')}
                                                                           resizeMode='stretch'>
                                                              {this.showTag(item.tagids)}
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
                                <FlatList style={styles.list}
                                          data={['北京', '天津', '河北']}
                                          renderItem={({item}) =>
                                              <View>
                                                  <Text>
                                                      {item}
                                                  </Text>
                                              </View>
                                          }
                                          keyExtractor={(item, index) => index}
                                />
                            </Animated.View>
                        </View>
                    );
                    break;
                } else {
                    //空数据
                    return (
                        <ImageBackground style={styles.waitLoadContainer}
                                         source={require('./images/LiveLobby/liveLobby_mask_empty.png')}
                                         resizeMode='stretch'>
                            <Image style={styles.waitLoadContainerIndicator}
                                   source={require('./images/LiveLobby/liveLobby_icon_anchorEmpty.png')}
                            />
                        </ImageBackground>
                    );
                    break;
                }
            }
        }
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
    list: {
        backgroundColor: 'rgba(240,240,240,1)',
        height: SCREEN_HEIGHT - 170,
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
    cellItemImgTagBar: {
        backgroundColor: 'rgba(0,0,0,0)',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: (SCREEN_WIDTH - 21) / 2 - 23,
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
        height: SCREEN_HEIGHT - 115,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitLoadContainerIndicator: {
        height: 80,
    },
    //FailLoading
    failLoadContainer: {
        height: SCREEN_HEIGHT - 115,
        justifyContent: 'center',
        alignItems: 'center',
    },
    failLoadContainerText: {
        color: 'gray',
    }
});

module.exports = Vicinity;