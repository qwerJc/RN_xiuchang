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

import PullDownRefreshView from './PullDownRefreshView'
import GoodVoiceLevelView from './GoodVoiceLevelView'

import AnchorPostDisplay from './AnchorPostDisplay'
import FailPostDisplay from './FailPostDisplay'
import LoadPostDisplay from './LoadPostDisplay'
import EmptyPostDisplay from './EmptyPostDisplay'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const IS_5_8_DEVICE = Dimensions.get('window').height == 812;

class GoodVoice extends React.Component {
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

        this.anchorDataSource = [['null'], ['null'], ['null'], ['null'], ['null'], ['null']];//二维数组，其中0-5分别对应全部、炽星、超星、巨星、明星、红人
        //如果每一项中不为null则会导致不进Flatlist的render（因为绑定的数据源数量为0），所以必须写一项。
        this.tagInfo = [];

        this.postType = ['u0','r10','r5','r4','r1','r2'];
        this.nowLevelChose = 0;//level标签选择，0-5 同 anchorDataSource

        //下面为下拉刷新相关属性
        this.mainListoffsetY = 0;
        this.timeDate = [0, 0, 0, 0, 0, 0];
        this.isTouchPullDown = false; //判断当前是否处于用户拖动状态

        this.state = {
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功,2为空数据
        };
    }

    propTypes: {
        liveLobbyContainerCallback: PropTypes.func,
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

    post(nowChosenLevel) {
        this.timeDate[nowChosenLevel] = (new Date()).valueOf();     //更新时间戳

        let requestParams = new FormData();
        requestParams.append("rate", this.rate);
        requestParams.append("type", this.postType[nowChosenLevel]);
        requestParams.append("size", '0');
        requestParams.append("p", '0');
        requestParams.append("av", this.props.av);
        requestParams.append('logiuid', this.uid);
        requestParams.append('encpass', this.encpass);
        if (this.rate){
            requestParams.append('rand', this.rand);
        }

        console.log("【好声音 页面将要打开】");
        fetch('http://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getlivelistnew.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestParams,
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
                this._refPullDownRefreshView.showPullDownView(3);
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
                this._refPullDownRefreshView.showPullDownView(3);
                this.mainList.scrollToOffset({animated: true, offset: 0});
            })
    }

    autoRefresh() {
        this.isTouchPullDown = false;

        if (this.timeDate[this.nowLevelChose] == 0) {
            console.log('第一次点击');
            this.setState({
                loadState: 0,
            });
            this.post(this.nowLevelChose);
        } else {
            console.log('不是第一次点击 ' + this.timeDate[this.nowLevelChose]);
            let nowTime = (new Date()).valueOf();
            let diff = nowTime - this.timeDate[this.nowLevelChose];

            if (diff > this.props.refreshInterval) {
                console.log('且 距离上次点击已经3分钟');
                this.mainList.scrollToOffset({animated: true, offset: -44});
                this._refPullDownRefreshView.showPullDownView(2);
            } else {
                this.setState({
                    loadState: 1,
                });
                console.log('不需要刷新');
            }
        }

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

        this.nowLevelChose = index;
        this.autoRefresh();
        // this.props.liveLobbyContainerCallback(index);
    }

    renderAnchorItem(item, index) {
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
                return (//添加顶部的空隙
                    <View>
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

    renderListFooterComponent(){
        if (IS_5_8_DEVICE) {
            return (
                <View style={[styles.listFooter,{height:90}]}>
                </View>
            );
        }else {
            return (
                <View style={[styles.listFooter,{height:56}]}>
                </View>
            );
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

                <PullDownRefreshView ref={(c) => this._refPullDownRefreshView = c}
                                     callbackPost={() => this.post(this.nowLevelChose)}/>

                <FlatList style={styles.list}
                          data={this.returnDataSource()}
                          numColumns={2}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          initialNumToRender={3}
                          ListHeaderComponent={<GoodVoiceLevelView GoodVoiceCallbackSelect={(index) => this._onSelectLevel(index)}/>}
                          ListFooterComponent={()=>this.renderListFooterComponent()}
                          renderItem={({item, index}) =>
                              this.renderAnchorItem(item, index)
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

const
    styles = StyleSheet.create({
        //下拉刷新
        bgVIew: {
            backgroundColor: 'rgba(240,240,240,1)',
        },
        list: {
            backgroundColor: 'rgba(255,255,255,0)',
            height: SCREEN_HEIGHT,
        },
        anchorGap: {
            backgroundColor: 'rgba(240,240,240,1)',
            width: (SCREEN_WIDTH - 7 ) / 2,
            height: 7,
        },
    });

module.exports = GoodVoice;