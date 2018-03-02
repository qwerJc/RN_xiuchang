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

class MiniVideoTypeView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowTypeChose: 0, //0-2 分别对应 推荐 关注 最新
        };
    }

    propTypes : {
        callbackSelect : PropTypes.func,
    }

    _onSelectLevel(type) {
        console.log(type);
        this.setState({
            nowTypeChose: type,
        });
        this.props.callbackSelect(type);
    }



    render() {
        switch (this.state.nowTypeChose) {
            case 0: {
                console.log('-----');
                return (
                    <View style={styles.typeView}>

                        <View style={styles.typeViewItem}>
                            <Text style={[styles.typeViewTitle, {color: 'red',}]}>推荐</Text>
                        </View>

                        <Text style={styles.typeViewSeparation}></Text>

                        <TouchableWithoutFeedback onPress={() => this._onSelectLevel(1)}>
                            <View style={styles.typeViewItem}>
                                <Text style={styles.typeViewTitle}>关注</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <Text style={styles.typeViewSeparation}></Text>

                        <TouchableWithoutFeedback onPress={() => this._onSelectLevel(2)}>
                            <View style={styles.typeViewItem}>
                                <Text style={styles.typeViewTitle}>最新</Text>
                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                );
            }
            case 1: {
                return (
                    <View style={styles.typeView}>
                        <TouchableWithoutFeedback onPress={() => this._onSelectLevel(0)}>
                            <View style={styles.typeViewItem}>
                                <Text style={styles.typeViewTitle}>推荐</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <Text style={styles.typeViewSeparation}></Text>
                        <View style={styles.typeViewItem}>
                            <Text style={[styles.typeViewTitle, {color: 'red',}]}>关注</Text>
                        </View>
                        <Text style={styles.typeViewSeparation}></Text>

                        <TouchableWithoutFeedback onPress={() => this._onSelectLevel(2)}>
                            <View style={styles.typeViewItem}>
                                <Text style={styles.typeViewTitle}>最新</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                );
            }
            case 2: {
                return (
                    <View style={styles.typeView}>
                        <TouchableWithoutFeedback onPress={() => this._onSelectLevel(0)}>
                            <View style={styles.typeViewItem}>
                                <Text style={styles.typeViewTitle}>推荐</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={styles.typeViewSeparation}></Text>
                        <TouchableWithoutFeedback onPress={() => this._onSelectLevel(1)}>
                            <View style={styles.typeViewItem}>
                                <Text style={styles.typeViewTitle}>关注</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={styles.typeViewSeparation}></Text>

                        <View style={styles.typeViewItem}>
                            <Text style={[styles.typeViewTitle, {color: 'red',}]}>最新</Text>
                        </View>
                    </View>
                );
            }
        }
    }

}

const styles = StyleSheet.create({
        typeView: {
            height: 40,
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'flex-start', //定义了伸缩项目在主轴线的对齐方式
            alignItems: 'center',
        },
        typeViewItem: {
            width: (SCREEN_WIDTH - 1) / 3,
            justifyContent: 'center',
            alignItems: 'center',
        },
        typeViewTitle: {
            // marginLeft: (SCREEN_WIDTH - 30 * 3 - 2) / 6,
            width: 30,
            height: 16,
            color: 'rgba(102,102,102,1)',
            fontSize: 13,
        },
        typeViewSeparation: {
            // marginLeft: (SCREEN_WIDTH - 30 * 3 - 1) / 6,
            width: 0.5,
            height: 18,
            backgroundColor: 'rgba(102,102,102,1)',
            // backgroundColor:'green',
        },
    });

module.exports = MiniVideoTypeView;