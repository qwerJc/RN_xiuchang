import React, {
    Component
} from 'react';
import {
    StyleSheet,
    FlatList,
    Dimensions,
    View,
    Text,
    Image,
    Animated,
    PanResponder,
    ActivityIndicator,
} from 'react-native'

import AnchorPostDisplay from './AnchorPostDisplay'
import FailPostDisplay from './FailPostDisplay'
import LoadPostDisplay from './LoadPostDisplay'
import EmptyPostDisplay from './EmptyPostDisplay'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class Universal extends React.Component {
    constructor(props) {
        super(props);
        this.anchorDataSource = ['null'];//主播list数据源，默认必须有个字符串以保证空数据或请求错误时渲染界面
        this.tagInfo = [];//所有tag标签的数据
        this.mainListoffsetY = 0;
        this.timeDate = 0;
        this.isTouchPullDown = true; //判断当前是否处于用户拖动状态
        this.state = {
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功,2为空数据
            imgArrowState: 0,
            pullDownState1: 0, //下拉刷新状态：0为正常上滑，1为开始下拉，2为过了下拉的临界值，松手即更新,3为加载中
            //4 加载完成
        };
    }

    componentWillMount() {
        this.post();
        this.timeDate = (new Date()).valueOf();
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    returnJsonData(json){
        // console.log(this.props.type);
        switch (this.props.type){
            case 'u1':{//舞蹈
                console.log('舞蹈');
                return json.content.u1;
                break;
            }
            case 'u2':{//搞笑
                console.log('搞笑');
                return json.content.u2;
                break;
            }
            case 'u3':{//唠嗑
                console.log('唠嗑');
                return json.content.u3;
                break;
            }
            case 'male':{//男神
                console.log('男神');
                return json.content.male;
                break;
            }
        }
    }

    post() {
        this.timeDate = (new Date()).valueOf();     //更新时间戳

        let formdata = new FormData();
        formdata.append("rate", '1');
        formdata.append("type", this.props.type);
        formdata.append("size", '0');
        formdata.append("p", '0');
        formdata.append("av", '2.7');

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

                let data = this.returnJsonData(json);
                console.log("【************* Success *****************】 ");
                if (data.length > 0) {
                    //请求成功 且 返回数据不为空 替换当前数据
                    this.anchorDataSource = this.returnJsonData(json);
                    this.tagInfo = data;
                    this.setState({
                        loadState: 1,
                    });
                } else {
                    if (this.anchorDataSource[0] == 'null') {
                        //请求成功 但 返回空数据 且 之前无请求成功的数据 渲染空页面
                        this.setState({
                            loadState: 2,
                        })
                    } else {
                        //请求成功 返回空数据 但 之前存在请求成功的数据，渲染旧页面
                        this.setState({
                            loadState: 1,
                        })
                    }
                }
                this.showPullDownView(3);
                this.mainList.scrollToOffset({animated: true, offset: 0});
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error);
                if (this.anchorDataSource[0] == 'null') {
                    //请求失败 且 之前无请求成功的数据 渲染"请求错误"页面
                    this.setState({
                        loadState: -1,
                    })
                } else {
                    //请求失败 但 之前存在请求成功的数据， 渲染旧页面
                    this.setState({
                        loadState: 1,
                    });
                }
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
                    this.post();
                },
                300
            );
        }
    }

    //将请求失败、成功等页面同样当作一个cell，根据请求的状态使flatlist渲染不同的cell
    returnAnchorItem(item) {
        switch (this.state.loadState) {
            //请求失败
            case -1: {//data.length = 1
                return (<FailPostDisplay layoutType={2}/>);
                break;
            }
            case 0: {//请求中
                return (<LoadPostDisplay layoutType={2}/>);
                break;
            }
            case 1: {//请求成功
                return (
                    <View style={styles.cellItem}>
                        <View style={styles.anchorGap}>
                        </View>
                        <AnchorPostDisplay dataDic={item} tagsDic={this.tagInfo}/>
                    </View>
                );
                break;
            }
            case 2: {//空数据
                return (<EmptyPostDisplay layoutType={2}/>);
                break;
            }
        }
    }

    //由于等待中时候，数据源为上次请求的结果（会导致多行等待cell），所以需要根据状态判断，修改等待中的数据源
    returnDataSource() {
        // console.log(this.anchorDataSource[0].username);
        if (this.state.loadState == 0) {
            //等待状态,返回单cell
            return (['null']);
        } else {
            return (this.anchorDataSource);
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
                            style={{marginRight:7}}
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
                          initialNumToRender={3}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          renderItem={({item, index}) =>
                              this.returnAnchorItem(item)
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
                    this.post();
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

module.exports = Universal;