import React, {
    Component
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableWithoutFeedback,
    Dimensions,
    ImageBackground,
    Image,
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class GoodVoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [
                {
                    "wealthrank": 0,
                    "username": "",
                    "pic": "",
                    "rid": "",
                    "h264": "",
                    "isRecommend": 1,
                    "ut": 1,
                    "rtype": "",
                    "count": 0,
                    "honor": "",
                    "userMood": "",
                    "tagid": "",
                    "uid": "",
                    "minigame": 0,
                    "sex": 0,
                    "goldAnchor": 0,
                    "zy": 0,
                    "score": 0,
                    "isSproutingAnchor": 0,
                    "recscore": 0,
                    "anchorTm": "1505897369",
                    "ltype": 3,
                    "sound": 0,
                    "alevel": "r1",
                    "isvideo": 0,
                    "videotype": 1,
                    "recordtype": 0,
                    "flvtitle": "f50669734-128547854",
                    "secflvtitle": "f50669734-128547854_200",
                    "mgid": 0,
                    "pospic": "https://vi0.6rooms.com/live/2017/08/23/18/1010v1503485367918384222_s.jpg",
                    "tala": 0,
                    "talc": 0,
                    "province": "",
                    "tagids": [],
                    "largepic": "",
                    "realstarttime": 0
                }]
        };
    }

    componentWillMount() {
        var formdata = new FormData();
        formdata.append("rate", '1')
        formdata.append("type", 'u0')
        formdata.append("size", '0')
        formdata.append("p", '0')
        formdata.append("av", '2.1')

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
                // console.log(json)
                console.log(json.content.u0[0].username)
                this.setState({
                    dataSource: json.content.u0,
                });
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error)
            })
    }

    _onSelect() {
        console.log('click');
        //<Image style={styles.cellItemBottomBarIcon} source={require('./images/LiveLobby/LiveLobby_icon_username.png')}></Image>
    }

    render() {
        console.log(this.state.dataSource[0].username);
        return (
            <FlatList style={styles.list}
                      data={this.state.dataSource}
                      numColumns ={2}
                      renderItem={({item}) =>
                          <View style={styles.cell}>
                              <TouchableWithoutFeedback onPress={() => this._onSelect(item.PicL)}>
                                  <View style={styles.cellItem}>
                                      <Image style={styles.cellItemImg} source={{uri: item.pospic}}></Image>
                                      <View style={styles.cellItemBottomBar}>
                                          <Text style={styles.cellItemBottomBarName}
                                                numberOfLines={1}>{item.username}</Text>
                                          <Image style={styles.cellItemBottomBarIcon}
                                                 source={require('./images/LiveLobby/liveLobby_cell_Item_audienceCount.png')}></Image>
                                          <Text style={styles.cellItemBottomBarCount}>{item.count}</Text>
                                      </View>
                                  </View>
                              </TouchableWithoutFeedback>

                              <TouchableWithoutFeedback onPress={() => this._onSelect(item.PicR)}>
                                  <View style={styles.cellItem}>
                                      <Image style={styles.cellItemImg} source={{uri: item.pospic}}></Image>
                                      <View style={styles.cellItemBottomBar}>
                                          <Text style={styles.cellItemBottomBarName}
                                                numberOfLines={1}>{item.username}</Text>
                                          <Image style={styles.cellItemBottomBarIcon}
                                                 source={require('./images/LiveLobby/liveLobby_cell_Item_audienceCount.png')}></Image>
                                          <Text style={styles.cellItemBottomBarCount}>{item.count}</Text>
                                      </View>
                                  </View>
                              </TouchableWithoutFeedback>
                          </View>
                      }
            />
        );
    }
}

const styles = StyleSheet.create({
    bo: {
        flex: 1,
        backgroundColor: 'red',
    },
    cell: {
        backgroundColor: 'gray',
        flexDirection: 'row',
        marginLeft: 0,
        marginTop: 0,
        width: SCREEN_WIDTH,
        height: (SCREEN_WIDTH - 24) * 0.61,
        //0.61 = 440 / 360; 440:cellHeight ;    360: ItemWidth
        overflow: 'hidden',
    },
    cellItem: {
        flexDirection: 'column',
        marginLeft: 8,
        marginTop: 8,
        borderRadius: 10,
        overflow: 'hidden',
    },
    cellItemImg: {
        width: (SCREEN_WIDTH - 24) / 2,
        height: (SCREEN_WIDTH - 24) * 0.61 - 36,
        paddingBottom: 36,
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
        marginBottom: 6,
        width: 90,
        fontSize: 12,
    },
    cellItemBottomBarIcon: {
        width: 12,
        height: 10,
        marginRight: 0,
        marginLeft:4,
        marginBottom: 6,
    },
    cellItemBottomBarCount: {
        width: 37,
        marginRight: 4,
        marginBottom: 7,
        letterSpacing: 0,
        fontSize: 12,
    },
    cellImg: {
        width: (SCREEN_WIDTH - 24) / 2,
        height: (SCREEN_WIDTH - 24) / 2 * SCREEN_HEIGHT / SCREEN_WIDTH,
        backgroundColor: 'rgba(255,255,255,0.3)',
        flexDirection: 'row',
        justifyContent: 'space-between', //定义了伸缩项目在主轴线的对齐方式
    },
    cellImgTitle: {
        marginTop: 155,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
    },
});

module.exports = GoodVoice;