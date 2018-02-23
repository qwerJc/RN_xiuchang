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
} from 'react-native'

//点击选择后没有判空

import AnchorPostDisplay from './AnchorPostDisplay'
import FailPostDisplay from './FailPostDisplay'
import LoadPostDisplay from './LoadPostDisplay'
import EmptyPostDisplay from './EmptyPostDisplay'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

var isNeedupLoad = [true, true, true, true, true, true];

class GoodVoice extends React.Component {
    constructor(props) {
        super(props);
        this.anchorDataSource = [['null'],['null'],['null'],['null'],['null'],['null']];//二维数组，其中0-5分别对应全部、炽星、超星、巨星、明星、红人
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
        this.state = {
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功,2为空数据
            nowLevelChose: 0,   //level标签选择，0-5 同 anchorDataSource
        };
    }

    componentWillMount() {
        this.post(0);
    }
    post(nowChosenLevel){
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
                    if (this.anchorDataSource[nowChosenLevel][0] == 'null'){
                        this.setState({
                            loadState: 2,
                        });
                    }else {
                        //请求成功，当前返回的为空数据。但之前请求的数据成功且不为空，渲染旧cell
                        this.setState({
                            loadState: 1,
                        });
                    }
                }
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error);
                if (this.anchorDataSource[nowChosenLevel][0] == 'null'){
                    //请求失败 且 之前无请求的数据 渲染请求失败页面
                    this.setState({
                        loadState: -1,
                    });
                }else{
                    //请求失败 但 之前请求的数据成功且不为空，渲染旧cell
                    this.setState({
                        loadState: 1,
                    });
                }

            })
    }

    renderChoseLevelView() {
        return (
            <FlatList style={styles.levelView}
                      data={this.levelData}
                      numColumns={3}
                      renderItem={({item, index}) => {
                          if (index == this.state.nowLevelChose) {
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
        if (index != this.state.nowLevelChose) {//如果点击的不是当前level

            if (isNeedupLoad[index]) {
                isNeedupLoad[index] = false;
                console.log('==================【需要更新】=====================');

                this.setState({
                    loadState: 0,
                    nowLevelChose: index,
                });

                this.post(index);
            } else {
                this.setState({
                    nowLevelChose: index,
                });
                console.log("没到时间，不需要更新")
            }
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
                return (<AnchorPostDisplay dataDic={item} tagsDic={this.tagInfo}/>);
                break;
            }
            case 2: {
                return (<EmptyPostDisplay layoutType={1}/>);
                break;
            }
        }
    }

    returnDataSource(){
        // return (this.anchorDataSource);
        if(this.state.loadState == 0){
            //等待状态,返回单cell
            return (['null']);
        }else {
            return (this.anchorDataSource[this.state.nowLevelChose]);
        }
    }

    render() {
        return (
            <View>
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
                />
            </View>
        );
    }
}

const
    styles = StyleSheet.create({
        levelViewCell: {
            height: 44,
            backgroundColor: 'gray',
        },
        levelViewItem: {
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
            backgroundColor: 'rgba(240,240,240,1)',
            height: SCREEN_HEIGHT - 115,
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
            height: (SCREEN_WIDTH - 21) * 0.61 - 36,
            paddingBottom: 36,
        },
        cellItemImgTagBar: {
            backgroundColor: 'rgba(0,0,0,0)',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: (SCREEN_WIDTH - 21) * 0.61 - 59,
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
            height: SCREEN_HEIGHT - 170,
            width: SCREEN_WIDTH,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(240,240,240,1)',
        },
        waitLoadContainerIndicator: {
            height: 80,
        },
        //FailLoading
        failLoadContainer: {
            height: SCREEN_HEIGHT - 170,
            width: SCREEN_WIDTH,
            // paddingTop:200,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(240,240,240,1)',
        },
        failLoadContainerText: {
            color: 'gray',
        }
    });

module.exports = GoodVoice;