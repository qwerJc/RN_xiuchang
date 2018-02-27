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

import PullDownRefreshView from './PullDownRefreshView'

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
        this.isTouchPullDown = false; //判断当前是否处于用户拖动状态
        this.state = {
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功,2为空数据
            imgArrowState: 0,
        };
    }

    componentWillMount() {
        this.post();
        this.timeDate = (new Date()).valueOf();
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    returnJsonData(json) {
        // console.log(this.props.type);
        switch (this.props.type) {
            case 'u1': {//舞蹈
                console.log('舞蹈');
                return json.content.u1;
                break;
            }
            case 'u2': {//搞笑
                console.log('搞笑');
                return json.content.u2;
                break;
            }
            case 'u3': {//唠嗑
                console.log('唠嗑');
                return json.content.u3;
                break;
            }
            case 'male': {//男神
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
                this._refPullDownRefreshView.showPullDownView(3);
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
                this._refPullDownRefreshView.showPullDownView(3);
                this.mainList.scrollToOffset({animated: true, offset: 0});
            })
    }

    autoRefresh() {
        let nowTime = (new Date()).valueOf();
        let diff = nowTime - this.timeDate;

        if (diff > 1000) {
            console.log(this.timeDate);

            this.mainList.scrollToOffset({animated: true, offset: -44});
            this._refPullDownRefreshView.showPullDownView(2);

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


    jc1(){
        this.post();
        console.log('-----------------------------------');
    }


    render() {
        return (
            <View style={styles.bgVIew}>

                <PullDownRefreshView ref={(c) => this._refPullDownRefreshView = c}
                                     callbackPost={() => this.jc1()}
                />

                <FlatList style={styles.list}
                          data={this.returnDataSource()}
                          numColumns={2}
                          initialNumToRender={3}s
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