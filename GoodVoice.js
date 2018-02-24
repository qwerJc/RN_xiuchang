import React, {
    Component,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
    ActivityIndicator,
} from 'react-native'

//点击选择后没有判空

import AnchorPostDisplay from './AnchorPostDisplay'
import FailPostDisplay from './FailPostDisplay'
import LoadPostDisplay from './LoadPostDisplay'
import EmptyPostDisplay from './EmptyPostDisplay'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class GoodVoice extends React.Component {
    constructor(props) {
        super(props);
        this.anchorDataSource = [['null'], ['null'], ['null'], ['null'], ['null'], ['null']];//二维数组，其中0-5分别对应全部、炽星、超星、巨星、明星、红人
        //如果每一项中不为null则会导致不进Flatlist的render（因为绑定的数据源数量为0），所以必须写一项。
        this.tagInfo = [];
        this.levelData = [
            {
                "title": "全部",
                "iconURL": require('./images/LiveLobby/live_song_class_all_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_all_highlight.png'),
                "requestType": "u0",
            },
            {
                "title": "炽星",
                "iconURL": require('./images/LiveLobby/live_song_class_blazing_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_blazing_star_highlight.png'),
                "requestType": "r10",
            },
            {
                "title": "超星",
                "iconURL": require('./images/LiveLobby/live_song_class_super_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_super_star_highlight.png'),
                "requestType": "r5",
            },
            {
                "title": "巨星",
                "iconURL": require('./images/LiveLobby/live_song_class_big_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_big_star_highlight.png'),
                "requestType": "r4",
            },
            {
                "title": "明星",
                "iconURL": require('./images/LiveLobby/live_song_class_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_star_highlight.png'),
                "requestType": "r1",
            },
            {
                "title": "红人",
                "iconURL": require('./images/LiveLobby/live_song_class_little_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_little_star_highlight.png'),
                "requestType": "r2",
            },
        ];
        this.nowLevelChose = 0;//level标签选择，0-5 同 anchorDataSource

        //下面为下拉刷新相关属性
        this.mainListoffsetY = 0;
        this.timeDate = [0,0,0,0,0,0];
        this.isTouchPullDown = true; //判断当前是否处于用户拖动状态

        this.state = {
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功,2为空数据
        };
    }

    componentWillMount() {
        this.post(0);
    }

    post(nowChosenLevel) {
        // console.log('点击的 ： ' + nowChosenLevel);
        this.timeDate[nowChosenLevel] = (new Date()).valueOf();     //更新时间戳

        var formdata = new FormData();
        formdata.append("rate", '1');
        formdata.append("type", this.levelData[nowChosenLevel].requestType);
        formdata.append("size", '0');
        formdata.append("p", '0');
        formdata.append("av", '2.1');

        console.log("【好声音 页面将要打开】");
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
                if (this.getJsonContentData(nowChosenLevel, json).length > 0) {
                    //请求成功 且 请求返回的数据不为空，替换当前值
                    this.anchorDataSource[nowChosenLevel] = this.getJsonContentData(nowChosenLevel, json);
                    this.tagInfo = json.content.tagInfo;
                    this.setState({
                        loadState: 1,
                    });
                } else {
                    //请求成功 但 当前返回的为空数据，且 之前无请求的数据。渲染空数据页面
                    if (this.anchorDataSource[nowChosenLevel][0] == 'null') {
                        this.setState({
                            loadState: 2,
                        });
                    } else {
                        //请求成功，当前返回的为空数据。但之前请求的数据成功且不为空，渲染旧cell
                        this.setState({
                            loadState: 1,
                        });
                    }
                }
                this.showPullDownView(3);
                this.mainList.scrollToOffset({animated: true, offset: 0});
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error);
                if (this.anchorDataSource[nowChosenLevel][0] == 'null') {
                    //请求失败 且 之前无请求的数据 渲染请求失败页面
                    this.setState({
                        loadState: -1,
                    });
                } else {
                    //请求失败 但 之前请求的数据成功且不为空，渲染旧cell
                    this.setState({
                        loadState: 1,
                    });
                }
                this.showPullDownView(3);
                this.mainList.scrollToOffset({animated: true, offset: 0});
            })
    }

    autoRefresh() {
        this.isTouchPullDown = false;
        console.log('自动刷新');
        console.log(this.nowLevelChose);

        if(this.timeDate[this.nowLevelChose]== 0){
            console.log('第一次点击');
            this.post(this.nowLevelChose);
        }else {
            console.log('不是第一次点击');
            let nowTime = (new Date()).valueOf();
            let diff = nowTime - this.timeDate[this.nowLevelChose];

            if (diff > 180000) {
                console.log('且 距离上次点击已经3分钟');
                this.mainList.scrollToOffset({animated: true, offset: -44});
                this.showPullDownView(2);
                this.timer = setTimeout(
                    () => {
                        this.post(this.nowLevelChose);
                    },
                    300
                );
            }else {
                this.setState({
                    loadState: 1,
                });
                console.log('不需要刷新');
            }
        }

    }

    renderChoseLevelView() {
        return (
            <FlatList data={this.levelData}
                      numColumns={3}
                      renderItem={({item, index}) => {
                          if (index == this.nowLevelChose) {
                              return (
                                  <TouchableWithoutFeedback onPress={() => this._onSelectLevel(index)}>
                                      <View style={styles.levelViewItem}>
                                          <Image source={item.iconURL_H}/>
                                          <Text style={{marginLeft: 6, color: 'rgba(255,0,146,1)'}}>{item.title}</Text>
                                      </View>
                                  </TouchableWithoutFeedback>
                              );
                          } else {
                              return (
                                  <TouchableWithoutFeedback onPress={() => this._onSelectLevel(index)}>
                                      <View style={styles.levelViewItem}>
                                          <Image source={item.iconURL}/>
                                          <Text style={{marginLeft: 6}}>{item.title}</Text>
                                      </View>
                                  </TouchableWithoutFeedback>
                              );
                          }
                      }
                      }
                      keyExtractor={(item, index) => index}
            >
            </FlatList>
        )
    }

    getJsonContentData(index, json) {
        switch (index) {
            case 0: {
                return json.content.u0;
                break;
            }
            case 1: {
                return json.content.r10;
                break;
            }
            case 2: {
                return json.content.r5;
                break;
            }
            case 3: {
                return json.content.r4;
                break;
            }
            case 4: {
                return json.content.r1;
                break;
            }
            case 5: {
                return json.content.r2;
                break;
            }
        }
    }

    _onSelectLevel(index) {
        if (index != this.nowLevelChose) {//如果点击的不是当前level

            this.nowLevelChose = index;

            if (this.timeDate[index] == 0){
                this.setState({
                    loadState: 0,
                });
            }
            this.autoRefresh();
        }
    }

    returnAnchorItem(item, index) {
        switch (this.state.loadState) {
            case -1: {
                return (<FailPostDisplay layoutType={1}/>);
                break;
            }
            case 0: {
                return (<LoadPostDisplay layoutType={1}/>);
                break;
            }
            case 1: {
                // console.log(item);
                return (
                    <View style={styles.cellItem}>
                        <View style={styles.anchorGap}></View>
                        <AnchorPostDisplay dataDic={item} tagsDic={this.tagInfo}/>
                    </View>
                );
                break;
            }
            case 2: {
                return (<EmptyPostDisplay layoutType={1}/>);
                break;
            }
        }
    }

    returnDataSource() {
        // return (this.anchorDataSource);
        if (this.state.loadState == 0) {
            //等待状态,返回单cell
            return (['null']);
        } else {
            return (this.anchorDataSource[this.nowLevelChose]);
        }
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
                          data={this.returnDataSource()}
                          numColumns={2}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          initialNumToRender={3}
                          ListHeaderComponent={this.renderChoseLevelView.bind(this)}
                          renderItem={({item, index}) =>
                              this.returnAnchorItem(item, index)
                          }
                          keyExtractor={(item, index) => index}
                          scrollEventThrottle={30}
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
                    this.post(this.nowLevelChose);
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

const
    styles = StyleSheet.create({
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
        //等级选择
        levelViewItem: {
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: 44,
            width: SCREEN_WIDTH / 3,
            borderWidth: 0.5,
            borderLeftWidth: 0,
            borderColor: 'rgba(220, 220, 220, 1)',
        },
        list: {
            backgroundColor: 'rgba(255,255,255,0)',
            height: SCREEN_HEIGHT - 115,
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

module.exports = GoodVoice;