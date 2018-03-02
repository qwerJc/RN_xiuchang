import React, { Component } from 'react';

import {
    AppRegistry,
    Dimensions,
    Image,
    NativeModules,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class CycleSlideDisplay extends Component {

    static defaultProps = {
        arrData : [], // 数据
        width : 0,
        height : 0, // 高度
        dotStyle : 0, // 点的样式：0 - 中间、1 - 右下角
    }

    constructor(props: any) {
        super(props);

        this.rnCallNativeManager = NativeModules.RNCallNativeManager; // rn 向 native 发送通知

        this.scrollView;

        this.startContentOffset;
        this.oldCurrentPage = -100;
        this.currentPageIndex;

        this.timer; // 自动播放 timer
        this.initialTimer; // 初始化 timer

        this.state = {
            currentPageIndex: 0,
        };

        this.startTimer = this.startTimer.bind(this);
    }

    render() {

        let scrollViewWidth = 0;
        let canScroll = false;

        if (this.props.arrData.length > 1) {
            scrollViewWidth = this.props.width * (this.props.arrData.length + 2);
            canScroll = true;
        } else {
            scrollViewWidth = this.props.width;
            canScroll = false;
        }

        // console.log('width = ' + this.props.width);
        // console.log('height = ' + this.props.height);

        return(
            <View style={{
                flexDirection:'row',

                marginLeft:0,
                marginTop:0,
                width:this.props.width,
                height:this.props.height,
            }}>
                <ScrollView contentContainerStyle={{
                    flexDirection:'row',

                    marginLeft:0,
                    marginTop:0,
                    width:scrollViewWidth,
                    height:this.props.height,
                }}
                ref={(refScrollView) => {this.scrollView = refScrollView}}
                scrollEventThrottle={16}

                onScrollBeginDrag={(event) => this.scrollViewBeginDrag(event.nativeEvent.contentOffset.x)}
                onScrollEndDrag={(event) => this.scrollViewEndDrag(event.nativeEvent.contentOffset.x)}
                onScroll={(event) => this.scrollViewOnScroll(event.nativeEvent.contentOffset.x)}
                onMomentumScrollEnd={(event) => this.scrollViewScrollEnd(event.nativeEvent.contentOffset.x)}

                horizontal={true}
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                scrollEnabled={canScroll}>

                    {this.renderPromotions()}

                </ScrollView>

                {this.renderPageControl()}
            </View>
        );
    }

    renderPromotions() {

        let arrButtons = [];
        let canScroll = this.props.arrData.length > 1;
        let lastIndex = this.props.arrData.length - 1;

        if (canScroll) {
            arrButtons.push(
                <TouchableOpacity style={{
                    marginLeft:0,
                    marginTop:0,
                    width:this.props.width,
                    height:this.props.height,
                }} onPress={this.buttonAction.bind(this, lastIndex)} activeOpacity={1}>

                    <Image style={{
                        marginLeft:0,
                        marginTop:0,
                        width:this.props.width,
                        height:this.props.height,
                    }} source={{uri: this.props.arrData[lastIndex].image}}>
                    </Image>

                </TouchableOpacity>
            );
        }

        for (let i = 0; i < this.props.arrData.length; i++) {
            arrButtons.push(
                <TouchableOpacity style={{
                    marginLeft:0,
                    marginTop:0,
                    width:this.props.width,
                    height:this.props.height,
                }} onPress={this.buttonAction.bind(this, i)} activeOpacity={1}>

                    <Image style={{
                        marginLeft:0,
                        marginTop:0,
                        width:this.props.width,
                        height:this.props.height,
                    }} source={{uri: this.props.arrData[i].image}}>
                    </Image>

                </TouchableOpacity>
            );
        }

        if (canScroll) {
            arrButtons.push(
                <TouchableOpacity style={{
                    marginLeft:0,
                    marginTop:0,
                    width:this.props.width,
                    height:this.props.height,
                }} onPress={this.buttonAction.bind(this, 0)} activeOpacity={1}>

                    <Image style={{
                        marginLeft:0,
                        marginTop:0,
                        width:this.props.width,
                        height:this.props.height,
                    }} source={{uri: this.props.arrData[0].image}}>
                    </Image>

                </TouchableOpacity>
            );
        }

        return arrButtons;
    }

    renderPageControl() {

        if (this.props.arrData.length > 1) {
            let viewStyle;
            let length = 7 * this.props.arrData.length + 6 * (this.props.arrData.length - 1)

            switch (this.props.dotStyle) {
                case 0:{
                    viewStyle = {
                        position:'absolute',

                        flexDirection:'row',

                        marginLeft:(this.props.width - length) / 2,
                        marginTop:this.props.height - 16,
                        width:length,
                        height:7,
                    }
                }
                    break;
                case 1:{

                }
                    break;

                default:
                    break;
            }

            return(
                <View style={viewStyle}>
                    {this.renderDots()}
                </View>
            );
        }
    }

    renderDots() {

        let  arrButtons = [];

        for (let i = 0; i < this.props.arrData.length; i++) {

            let marginLeft = i == 0 ? 0 : 6;
            let image = i == this.state.currentPageIndex ? require('./images/LiveLobby/live_lobby_image_pageControl_Selected.png') : require('./images/LiveLobby/live_lobby_image_pageControl_Normal.png');

            arrButtons.push(
                <Image style={{
                    marginLeft:marginLeft,
                    marginTop:0,
                    width:7,
                    height:7,
                }} source={image}>
                </Image>
            );
        }

        return arrButtons;
    }

    componentWillMount() {

        if (this.props.arrData.length > 1) {
            // 先清空计时器
            this.stopTimer();
            this.startContentOffset = 9999;
            this.startTimer();

            this.initialTimer = setTimeout(
                ()=>{

                this.scrollView.scrollTo({x: this.props.width, y: 0, animated: false});
            },
                10,
            );
        }
    }

    componentWillUnmount() {
        this.stopTimer();

        this.initialTimer && clearTimeout(this.initialTimer);
    }

    scrollViewBeginDrag(offsetX) {
        this.startContentOffset = offsetX;

        this.stopTimer();
    }

    scrollViewEndDrag(offsetX) {
        this.scrollView.scrollEnabled = true;
        this.startContentOffset = 9999;
        this.startTimer();
    }

    scrollViewOnScroll(offsetX) {

        let contentSize = this.props.width * (this.props.arrData.length + 2);

        if (offsetX <= 0) {
            this.scrollView.scrollTo({x: contentSize - this.props.width * 2, y: 0, animated: false});
        }
        if (offsetX >= contentSize - this.props.width) {
            this.scrollView.scrollTo({x: this.props.width, y: 0, animated: false});
        }

        if (this.startContentOffset != 9999) {
            if ((offsetX + this.props.width) > contentSize) {
                this.scrollView.scrollTo({x: contentSize - this.props.width * 2, y: 0, animated: false});
            } else if (offsetX < 0) {
                this.scrollView.scrollTo({x: contentSize - this.props.width * 2, y: 0, animated: false});
            } else if (offsetX + this.props.width <= this.startContentOffset) {
                offsetX = this.startContentOffset - this.props.width;
                this.scrollView.scrollEnabled = false;
            } else if (offsetX - this.props.width >= this.startContentOffset) {
                offsetX = this.startContentOffset + this.props.width;
                this.scrollView.scrollEnabled = false;
            }
        }

        this.calculatePageNum(offsetX);
    }

    scrollViewScrollEnd(offsetX) {
        this.scrollView.scrollTo({x: this.props.width * (this.state.currentPageIndex + 1), y: 0, animated: true});
    }

    startTimer() {

        if (this.props.arrData.length <= 1) {
            return;
        }

        this.timer = setInterval(
            ()=>{
                console.log('timer go!');

                // this.scrollView.scrollTo({x: this.props.width * (this.state.currentPageIndex + 1), y: 0, animated: true});
            },
            3000,
        );
    }

    calculatePageNum(offsetX) {

        let contentSize = this.props.width * (this.props.arrData.length + 2);
        let pageWidth = this.props.width;
        let maxPage = Math.ceil(contentSize / pageWidth);
        let currentPage = Math.floor((offsetX - pageWidth / 2) / pageWidth) + 1;

        // console.log('current page ' + currentPage + ' old ' + this.oldCurrentPage);

        if (currentPage >= 0 && currentPage <= maxPage && currentPage != this.oldCurrentPage) {
            let validNextPageIndex = this.getValidNextPageIndexWithPageIndex(currentPage);

            // console.log('currentPage ' + this.state.currentPageIndex + ' valid ' + validNextPageIndex);

            if (this.state.currentPageIndex != validNextPageIndex) {

                console.log('set state!!! ' + validNextPageIndex);

                this.setState({
                    currentPageIndex : validNextPageIndex,
                });
            }
        }

        oldCurrentPage = currentPage;
    }

    getValidNextPageIndexWithPageIndex(currentPageIndex) {

        let totalPageCount = this.props.arrData.length;

        currentPageIndex -= 1;
        if(currentPageIndex == -1) {
            return totalPageCount - 1;
        } else if (currentPageIndex == totalPageCount) {
            return 0;
        } else {
            return currentPageIndex;
        }
    }

    stopTimer() {
        this.timer && clearInterval(this.timer);
    }

    buttonAction(index) {

    }
}

const styles = StyleSheet.create({

});
