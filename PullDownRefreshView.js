import React, {
    Component,
} from 'react';
import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    Image,
    ActivityIndicator,
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;

class PullDownRefreshView extends React.Component {
    constructor(props) {
        super(props);
        this.postTimeDate = 0;
        this.state = {

        };
    }

    propTypes : {
        callbackPost : PropTypes.func,
    }

    render() {
        return (
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
        );
    }

    //flatlist 根据滑动距离计算下拉刷新状态
    judgeScrollState(offsetY,isDraging) {

        if (isDraging) { //下面的动画效果只应存在于拖动时，若不加判断会导致回弹动画时逆序触发下面动效
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
        }else {
            if (offsetY == -44){
                //此处的时间戳判断是由于scrollToOffset方法有可能会触发两次，所以用时间戳判断下
                let nowTime = (new Date()).valueOf();
                let diff = nowTime - this.postTimeDate;
                if (diff>100){
                    console.log('自动');
                    this.props.callbackPost();
                    this.postTimeDate = nowTime;
                }
            }
        }
    }

    //根据下拉状态显示不同的 下拉刷新view（其余隐藏）
    // 下拉刷新状态：0为开始下拉，1为过了下拉的临界值，松手即更新,2为加载中  3 加载完成
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

}

const styles = StyleSheet.create({
    pullDownRefreshBG: {
        // marginTop:64,
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
});

module.exports = PullDownRefreshView;